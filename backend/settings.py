import os
from pathlib import Path
from typing import ClassVar, Dict

try:
    from pydantic_settings import BaseSettings  # type: ignore
    HAS_PYDANTIC_SETTINGS = True
except ImportError:  # pragma: no cover
    HAS_PYDANTIC_SETTINGS = False
    from pydantic import BaseModel

    class BaseSettings(BaseModel):  # type: ignore[misc]
        env_file: ClassVar[str] = ".env"

        @classmethod
        def _read_env(cls, env_file: str) -> Dict[str, str]:
            path = Path(env_file)
            data: Dict[str, str] = {}
            if not path.exists():
                return data

            for line in path.read_text().splitlines():
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, value = line.split("=", 1)
                data[key.strip()] = value.strip()
            return data

        @classmethod
        def load(cls):
            env_values = cls._read_env(cls.env_file)
            data: Dict[str, str] = {}
            for field in cls.model_fields:
                if field in os.environ:
                    data[field] = os.environ[field]
                elif field in env_values:
                    data[field] = env_values[field]
            return cls(**data)


class Settings(BaseSettings):
    COMPANY_CODE: str = "TSGYO"
    COMPANY_NAME: str = "TSKB GYO"
    DEMO_MODE: bool = True

    class Config:
        env_file = ".env"


if HAS_PYDANTIC_SETTINGS:
    settings = Settings()
else:
    settings = Settings.load()
