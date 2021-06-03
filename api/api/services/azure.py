import logging
import typing
from azure.storage.blob import BlobServiceClient, BlobClient, ContainerClient
from django.conf import settings


logger = logging.getLogger(__name__)


class AzureBlobService(object):
    def __init__(self, *args, **kwargs):
        try:
            self.connection_string = settings.AZURE_STORAGE_CONNECTION_STRING
            self.blob_service_client = BlobServiceClient.from_connection_string(self.connection_string)
            self.image_container_client = self.blob_service_client.get_container_client('images')
        except Exception as ex:
            logger.exception(ex)
            raise ex

    def put_image(self, image_id: str, image_data: typing.Union[str, bytes]) -> None:
        try:
            blob_client = self.image_container_client.get_blob_client(image_id)
            blob_client.upload_blob(image_data)
        except Exception as ex:
            logger.exception(ex)
            raise ex
    
    def get_image(self, image_id: str) -> typing.Union[str, bytes]:
        try:
            blob_client = self.image_container_client.get_blob_client(image_id)
            return blob_client.download_blob().readall()
        except Exception as ex:
            logger.exception(ex)
            raise ex