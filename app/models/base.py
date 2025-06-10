from typing import Optional, Any
from pydantic import BaseModel, Field
from bson import ObjectId
from datetime import datetime


class PyObjectId(ObjectId):
    """Custom ObjectId class for Pydantic v2 compatibility"""
    @classmethod
    def __get_pydantic_core_schema__(cls, _source_type, _handler):
        from pydantic_core import core_schema
        return core_schema.union_schema([
            core_schema.is_instance_schema(ObjectId),
            core_schema.chain_schema([
                core_schema.str_schema(),
                core_schema.no_info_plain_validator_function(cls.validate),
            ])
        ])

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str):
            if ObjectId.is_valid(v):
                return ObjectId(v)
        raise ValueError('Invalid ObjectId')

    @classmethod
    def __get_pydantic_json_schema__(cls, _core_schema, handler):
        from pydantic_core import core_schema
        return handler(core_schema.str_schema())


class BaseDocument(BaseModel):
    """Base document model with common fields for all MongoDB documents"""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "created_at": "2023-01-01T00:00:00",
                "updated_at": "2023-01-01T00:00:00"
            }
        }

    def dict(self, **kwargs):
        """Override dict method to handle ObjectId serialization"""
        if kwargs.get('by_alias'):
            kwargs['exclude_unset'] = True
        return super().dict(**kwargs)
