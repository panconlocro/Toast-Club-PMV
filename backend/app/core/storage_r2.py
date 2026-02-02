"""Cloudflare R2 (S3-compatible) storage helpers.

This module provides a minimal wrapper around boto3 to upload files and
create presigned GET URLs. It is intentionally small to keep the PMV code
simple while enabling secure private audio storage.
"""
from typing import BinaryIO
import boto3
from botocore.config import Config
from .config import settings


def get_s3_client():
    """Return a boto3 S3 client configured for Cloudflare R2."""
    if not settings.R2_ENDPOINT_URL:
        raise RuntimeError("R2_ENDPOINT_URL is not configured")
    if not settings.R2_ACCESS_KEY_ID or not settings.R2_SECRET_ACCESS_KEY:
        raise RuntimeError("R2 credentials are not configured")

    return boto3.client(
        "s3",
        endpoint_url=settings.R2_ENDPOINT_URL,
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        region_name=settings.R2_REGION or None,
        config=Config(signature_version="s3v4"),
    )


def upload_fileobj(fileobj: BinaryIO, bucket: str, key: str, content_type: str | None = None) -> None:
    """Upload a file-like object to R2.

    Args:
        fileobj: Open file-like object at the correct position.
        bucket: Target bucket name.
        key: Object key inside the bucket.
        content_type: Optional MIME type for the object.
    """
    client = get_s3_client()
    extra_args = {"ContentType": content_type} if content_type else None
    client.upload_fileobj(fileobj, bucket, key, ExtraArgs=extra_args or {})


def presign_get_url(bucket: str, key: str, expires_seconds: int = 600) -> str:
    """Create a presigned URL for private GET access."""
    client = get_s3_client()
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": key},
        ExpiresIn=expires_seconds,
    )
