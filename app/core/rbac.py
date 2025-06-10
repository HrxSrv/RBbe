from typing import List
from fastapi import HTTPException, status, Depends
from enum import Enum
from app.models.user import UserRole
from app.api.v1.endpoints.auth import get_current_user
from loguru import logger

class Permission(str, Enum):
    # Customer management
    CREATE_CUSTOMER = "create_customer"
    UPDATE_CUSTOMER = "update_customer"
    DELETE_CUSTOMER = "delete_customer"
    VIEW_CUSTOMER = "view_customer"
    
    # User management
    CREATE_USER = "create_user"
    UPDATE_USER = "update_user"
    DELETE_USER = "delete_user"
    VIEW_USER = "view_user"
    INVITE_USER = "invite_user"
    
    # Job management
    CREATE_JOB = "create_job"
    UPDATE_JOB = "update_job"
    DELETE_JOB = "delete_job"
    VIEW_JOB = "view_job"
    PUBLISH_JOB = "publish_job"
    
    # Candidate management
    CREATE_CANDIDATE = "create_candidate"
    VIEW_CANDIDATE = "view_candidate"
    UPDATE_CANDIDATE = "update_candidate"
    DELETE_CANDIDATE = "delete_candidate"
    WRITE_CANDIDATES = "write_candidates"  # Combined create/update permission
    DELETE_CANDIDATES = "delete_candidates"  # Plural for bulk operations
    EXPORT_CANDIDATES = "export_candidates"
    
    # Call management
    CREATE_CALL = "create_call"
    UPDATE_CALL = "update_call"
    DELETE_CALL = "delete_call"
    VIEW_CALL = "view_call"
    SCHEDULE_CALL = "schedule_call"
    
    # Analytics and reporting
    VIEW_ANALYTICS = "view_analytics"
    EXPORT_DATA = "export_data"
    
    # System administration
    MANAGE_SUBSCRIPTIONS = "manage_subscriptions"
    SYSTEM_ADMIN = "system_admin"

# Role-based permissions mapping
ROLE_PERMISSIONS = {
    UserRole.SUPER_ADMIN: [
        Permission.CREATE_CUSTOMER, Permission.UPDATE_CUSTOMER, Permission.DELETE_CUSTOMER, Permission.VIEW_CUSTOMER,
        Permission.CREATE_USER, Permission.UPDATE_USER, Permission.DELETE_USER, Permission.VIEW_USER, Permission.INVITE_USER,
        Permission.CREATE_JOB, Permission.UPDATE_JOB, Permission.DELETE_JOB, Permission.VIEW_JOB, Permission.PUBLISH_JOB,
        Permission.CREATE_CANDIDATE, Permission.VIEW_CANDIDATE, Permission.UPDATE_CANDIDATE, Permission.DELETE_CANDIDATE, Permission.WRITE_CANDIDATES, Permission.DELETE_CANDIDATES, Permission.EXPORT_CANDIDATES,
        Permission.CREATE_CALL, Permission.UPDATE_CALL, Permission.DELETE_CALL, Permission.VIEW_CALL, Permission.SCHEDULE_CALL,
        Permission.VIEW_ANALYTICS, Permission.EXPORT_DATA, Permission.MANAGE_SUBSCRIPTIONS, Permission.SYSTEM_ADMIN,
    ],
    UserRole.COMPANY_ADMIN: [
        Permission.UPDATE_CUSTOMER, Permission.VIEW_CUSTOMER,
        Permission.CREATE_USER, Permission.UPDATE_USER, Permission.DELETE_USER, Permission.VIEW_USER, Permission.INVITE_USER,
        Permission.CREATE_JOB, Permission.UPDATE_JOB, Permission.DELETE_JOB, Permission.VIEW_JOB, Permission.PUBLISH_JOB,
        Permission.CREATE_CANDIDATE, Permission.VIEW_CANDIDATE, Permission.UPDATE_CANDIDATE, Permission.DELETE_CANDIDATE, Permission.WRITE_CANDIDATES, Permission.DELETE_CANDIDATES, Permission.EXPORT_CANDIDATES,
        Permission.CREATE_CALL, Permission.UPDATE_CALL, Permission.DELETE_CALL, Permission.VIEW_CALL, Permission.SCHEDULE_CALL,
        Permission.VIEW_ANALYTICS, Permission.EXPORT_DATA,
    ],
    UserRole.RECRUITER: [
        Permission.VIEW_CUSTOMER, Permission.VIEW_USER,
        Permission.CREATE_JOB, Permission.UPDATE_JOB, Permission.VIEW_JOB, Permission.PUBLISH_JOB,
        Permission.CREATE_CANDIDATE, Permission.VIEW_CANDIDATE, Permission.UPDATE_CANDIDATE, Permission.WRITE_CANDIDATES, Permission.EXPORT_CANDIDATES,
        Permission.CREATE_CALL, Permission.UPDATE_CALL, Permission.VIEW_CALL, Permission.SCHEDULE_CALL,
        Permission.VIEW_ANALYTICS,
    ],
    UserRole.VIEWER: [
        Permission.VIEW_CUSTOMER, Permission.VIEW_USER, Permission.VIEW_JOB,
        Permission.VIEW_CANDIDATE, Permission.VIEW_CALL, Permission.VIEW_ANALYTICS,
    ],
}

class RBACService:
    @staticmethod
    def get_user_permissions(role: UserRole) -> List[Permission]:
        permissions = ROLE_PERMISSIONS.get(role, [])
        logger.debug(f"Retrieved permissions for role {role.value}: {[p.value for p in permissions]}")
        return permissions
    
    @staticmethod
    def has_permission(user_role: UserRole, required_permission: Permission) -> bool:
        user_permissions = RBACService.get_user_permissions(user_role)
        has_perm = required_permission in user_permissions
        logger.debug(f"Permission check - Role: {user_role.value}, Required: {required_permission.value}, Has permission: {has_perm}")
        return has_perm

def require_permission(required_permission: Permission):
    def decorator(current_user: dict = Depends(get_current_user)):
        logger.info(f"RBAC permission check initiated - Required permission: {required_permission.value}")
        logger.debug(f"Current user data: {current_user}")
        
        user_role = current_user.get("role")
        logger.info(f"User role from token: {user_role} (type: {type(user_role)})")
        
        if not user_role:
            logger.error("403 FORBIDDEN - User role not found in current_user data")
            logger.debug(f"Available keys in current_user: {list(current_user.keys())}")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User role not found")
        
        try:
            user_role_enum = UserRole(user_role)
            logger.info(f"Successfully converted role to enum: {user_role_enum}")
        except ValueError as e:
            logger.error(f"403 FORBIDDEN - Invalid user role conversion: '{user_role}' -> {e}")
            logger.debug(f"Available UserRole values: {[role.value for role in UserRole]}")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid user role")
        
        if not RBACService.has_permission(user_role_enum, required_permission):
            user_permissions = RBACService.get_user_permissions(user_role_enum)
            logger.error(f"403 FORBIDDEN - Insufficient permissions")
            logger.error(f"User role: {user_role_enum.value}")
            logger.error(f"Required permission: {required_permission.value}")
            logger.error(f"User's permissions: {[p.value for p in user_permissions]}")
            logger.error(f"Permission check failed for user with role '{user_role_enum.value}' requesting '{required_permission.value}'")
            
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions. Required: {required_permission.value}"
            )
        
        logger.info(f"Permission check passed - User with role '{user_role_enum.value}' granted '{required_permission.value}'")
        return current_user
    return decorator

def require_role(required_roles: List[UserRole]):
    def decorator(current_user: dict = Depends(get_current_user)):
        logger.info(f"RBAC role check initiated - Required roles: {[role.value for role in required_roles]}")
        logger.debug(f"Current user data: {current_user}")
        
        user_role = current_user.get("role")
        logger.info(f"User role from token: {user_role} (type: {type(user_role)})")
        
        if not user_role:
            logger.error("403 FORBIDDEN - User role not found in current_user data")
            logger.debug(f"Available keys in current_user: {list(current_user.keys())}")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User role not found")
        
        try:
            user_role_enum = UserRole(user_role)
            logger.info(f"Successfully converted role to enum: {user_role_enum}")
        except ValueError as e:
            logger.error(f"403 FORBIDDEN - Invalid user role conversion: '{user_role}' -> {e}")
            logger.debug(f"Available UserRole values: {[role.value for role in UserRole]}")
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid user role")
        
        if user_role_enum not in required_roles:
            role_names = [role.value for role in required_roles]
            logger.error(f"403 FORBIDDEN - Insufficient role")
            logger.error(f"User role: {user_role_enum.value}")
            logger.error(f"Required roles (any of): {role_names}")
            logger.error(f"Role check failed for user with role '{user_role_enum.value}' requiring any of {role_names}")
            
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient role. Required any of: {role_names}"
            )
        
        logger.info(f"Role check passed - User with role '{user_role_enum.value}' matches required roles")
        return current_user
    return decorator

# Convenience decorators
def require_admin(current_user: dict = Depends(get_current_user)):
    logger.info("Admin access check initiated")
    return require_role([UserRole.SUPER_ADMIN, UserRole.COMPANY_ADMIN])(current_user)

def require_super_admin(current_user: dict = Depends(get_current_user)):
    logger.info("Super admin access check initiated")
    return require_role([UserRole.SUPER_ADMIN])(current_user)