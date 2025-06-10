from fastapi import UploadFile, HTTPException, status
from pathlib import Path
import aiofiles
import os
import uuid
from typing import Optional, Dict, Any
from datetime import datetime
import shutil
from loguru import logger

# Optional magic import for MIME type detection
try:
    import magic
    MAGIC_AVAILABLE = True
except ImportError:
    MAGIC_AVAILABLE = False
    logger.warning("python-magic not available. Using extension-based validation only.")

class FileUploadService:
    """
    Service for handling secure file uploads with validation and storage management.
    Designed specifically for resume uploads with support for PDF, DOC, and DOCX files.
    """
    
    # Allowed file types for resume uploads
    ALLOWED_MIME_TYPES = {
        "application/pdf",
        "application/msword", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"  # For plain text resumes
    }
    
    ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx", ".txt"}
    
    # File size limits
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    MIN_FILE_SIZE = 1024  # 1KB minimum
    
    # Storage configuration
    BASE_UPLOAD_DIR = Path("uploads")
    RESUMES_DIR = BASE_UPLOAD_DIR / "resumes"
    TEMP_DIR = BASE_UPLOAD_DIR / "temp"
    
    @classmethod
    async def validate_file(cls, file: UploadFile) -> Dict[str, Any]:
        """
        Comprehensive file validation including type, size, and content checks.
        
        Args:
            file: FastAPI UploadFile object
            
        Returns:
            Dict containing validation results and metadata
            
        Raises:
            HTTPException: If validation fails
        """
        try:
            # Read file content for validation
            content = await file.read()
            file_size = len(content)
            
            # Reset file pointer for later use
            await file.seek(0)
            
            # Validate file size
            if file_size > cls.MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File too large. Maximum size allowed: {cls.MAX_FILE_SIZE // (1024*1024)}MB"
                )
            
            if file_size < cls.MIN_FILE_SIZE:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"File too small. Minimum size required: {cls.MIN_FILE_SIZE} bytes"
                )
            
            # Validate file extension
            file_extension = Path(file.filename or "").suffix.lower()
            if file_extension not in cls.ALLOWED_EXTENSIONS:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid file type. Allowed types: {', '.join(cls.ALLOWED_EXTENSIONS)}"
                )
            
            # Validate MIME type using python-magic (if available)
            mime_type = "unknown"
            if MAGIC_AVAILABLE:
                try:
                    mime_type = magic.from_buffer(content, mime=True)
                    if mime_type not in cls.ALLOWED_MIME_TYPES:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Invalid file content type: {mime_type}. Allowed types: {', '.join(cls.ALLOWED_MIME_TYPES)}"
                        )
                except Exception as e:
                    logger.warning(f"MIME type detection failed: {e}")
                    mime_type = "unknown"
            else:
                logger.debug("MIME type detection skipped - python-magic not available")
            
            # Basic content validation
            if not content.strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="File appears to be empty or corrupted"
                )
            
            return {
                "is_valid": True,
                "file_size": file_size,
                "mime_type": mime_type,
                "extension": file_extension,
                "original_filename": file.filename
            }
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"File validation error: {e}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File validation failed. Please check file format and try again."
            )
    
    @classmethod
    async def save_file(cls, file: UploadFile, candidate_id: str, customer_id: str) -> Dict[str, Any]:
        """
        Save uploaded file to secure storage with proper organization.
        
        Args:
            file: Validated UploadFile object
            candidate_id: Unique candidate identifier
            customer_id: Customer/company identifier for organization
            
        Returns:
            Dict containing file metadata and storage information
        """
        try:
            # Create directory structure: uploads/resumes/{customer_id}/{candidate_id}/
            upload_dir = cls.RESUMES_DIR / customer_id / candidate_id
            upload_dir.mkdir(parents=True, exist_ok=True)
            
            # Generate secure filename
            file_extension = Path(file.filename or "").suffix.lower()
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            secure_filename = f"resume_{timestamp}{file_extension}"
            file_path = upload_dir / secure_filename
            
            # Save file asynchronously
            async with aiofiles.open(file_path, "wb") as f:
                content = await file.read()
                await f.write(content)
            
            # Generate file metadata
            file_metadata = {
                "file_path": str(file_path),
                "relative_path": str(file_path.relative_to(cls.BASE_UPLOAD_DIR)),
                "original_filename": file.filename,
                "secure_filename": secure_filename,
                "file_size": len(content),
                "candidate_id": candidate_id,
                "customer_id": customer_id,
                "upload_timestamp": datetime.utcnow(),
                "file_extension": file_extension
            }
            
            logger.info(f"File saved successfully: {file_path}")
            return file_metadata
            
        except Exception as e:
            logger.error(f"File save error: {e}")
            # Cleanup any partially created files
            if 'file_path' in locals() and file_path.exists():
                await cls.delete_file(str(file_path))
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save file. Please try again."
            )
    
    @classmethod
    async def delete_file(cls, file_path: str) -> bool:
        """
        Safely delete a file and its directory if empty.
        
        Args:
            file_path: Full path to the file to delete
            
        Returns:
            bool: True if deletion was successful, False otherwise
        """
        try:
            file_path_obj = Path(file_path)
            
            if file_path_obj.exists() and file_path_obj.is_file():
                # Ensure we're only deleting files within our upload directory
                if not str(file_path_obj.resolve()).startswith(str(cls.BASE_UPLOAD_DIR.resolve())):
                    logger.error(f"Attempted to delete file outside upload directory: {file_path}")
                    return False
                
                os.remove(file_path)
                logger.info(f"File deleted successfully: {file_path}")
                
                # Clean up empty parent directories
                parent_dir = file_path_obj.parent
                try:
                    if parent_dir.exists() and not any(parent_dir.iterdir()):
                        parent_dir.rmdir()
                        logger.info(f"Empty directory removed: {parent_dir}")
                except OSError:
                    # Directory not empty or other issues, ignore
                    pass
                
                return True
            else:
                logger.warning(f"File not found for deletion: {file_path}")
                return True  # Consider missing file as successfully "deleted"
                
        except Exception as e:
            logger.error(f"File deletion error: {e}")
            return False
    
    @classmethod
    async def cleanup_candidate_files(cls, candidate_id: str, customer_id: str) -> bool:
        """
        Remove all files associated with a candidate.
        
        Args:
            candidate_id: Candidate identifier
            customer_id: Customer identifier
            
        Returns:
            bool: True if cleanup was successful
        """
        try:
            candidate_dir = cls.RESUMES_DIR / customer_id / candidate_id
            
            if candidate_dir.exists():
                shutil.rmtree(candidate_dir)
                logger.info(f"Candidate files cleaned up: {candidate_dir}")
                
                # Clean up empty customer directory
                customer_dir = cls.RESUMES_DIR / customer_id
                try:
                    if customer_dir.exists() and not any(customer_dir.iterdir()):
                        customer_dir.rmdir()
                        logger.info(f"Empty customer directory removed: {customer_dir}")
                except OSError:
                    pass
                
            return True
            
        except Exception as e:
            logger.error(f"Candidate files cleanup error: {e}")
            return False
    
    @classmethod
    async def get_file_metadata(cls, file_path: str) -> Optional[Dict[str, Any]]:
        """
        Get metadata for an existing file.
        
        Args:
            file_path: Path to the file
            
        Returns:
            Dict with file metadata or None if file doesn't exist
        """
        try:
            file_path_obj = Path(file_path)
            
            if not file_path_obj.exists():
                return None
            
            stat = file_path_obj.stat()
            
            return {
                "file_path": str(file_path_obj),
                "file_size": stat.st_size,
                "created_at": datetime.fromtimestamp(stat.st_ctime),
                "modified_at": datetime.fromtimestamp(stat.st_mtime),
                "extension": file_path_obj.suffix.lower(),
                "filename": file_path_obj.name,
                "exists": True
            }
            
        except Exception as e:
            logger.error(f"Error getting file metadata: {e}")
            return None
    
    @classmethod
    def ensure_upload_directories(cls) -> None:
        """
        Ensure all required upload directories exist.
        """
        try:
            cls.BASE_UPLOAD_DIR.mkdir(exist_ok=True)
            cls.RESUMES_DIR.mkdir(exist_ok=True)
            cls.TEMP_DIR.mkdir(exist_ok=True)
            logger.info("Upload directories initialized successfully")
        except Exception as e:
            logger.error(f"Failed to create upload directories: {e}")
            raise
    
    @classmethod
    async def validate_and_save(cls, file: UploadFile, candidate_id: str, customer_id: str) -> Dict[str, Any]:
        """
        Complete workflow: validate file and save if valid.
        
        Args:
            file: UploadFile to process
            candidate_id: Candidate identifier
            customer_id: Customer identifier
            
        Returns:
            Dict containing both validation results and file metadata
        """
        # Ensure directories exist
        cls.ensure_upload_directories()
        
        # Validate file first
        validation_result = await cls.validate_file(file)
        
        # Save file if validation passed
        file_metadata = await cls.save_file(file, candidate_id, customer_id)
        
        # Combine results
        return {
            **validation_result,
            **file_metadata,
            "upload_successful": True
        } 