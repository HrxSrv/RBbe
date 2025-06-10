import os
import sys

if __name__ == "__main__":
    env = sys.argv[1] if len(sys.argv) > 1 else "dev"
    os.environ["ENVIRONMENT"] = env
    
    from app.main import app
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if env == "dev" else False
    ) 