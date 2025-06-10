# Import all models in the correct order to avoid circular imports
from .customer import Customer
from .user import User  
from .job import Job
from .candidate import Candidate
from .call import Call

# Rebuild models to resolve forward references
User.model_rebuild()
Job.model_rebuild() 
Call.model_rebuild()

__all__ = ["Customer", "User", "Job", "Candidate", "Call"] 