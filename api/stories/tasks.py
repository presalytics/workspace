import jsonpatch
import logging
from celery import shared_task
import typing
if typing.TYPE_CHECKING:
    from celery import Task

logger = logging.getLogger(__name__)


@shared_task
def sync_outlines_to_latest_patches():
    from stories.models import Outline
    outlines_to_update = Outline.objects.filter(patches__patch_is_applied=False).all()
    for outline in outlines_to_update:
        
        patches = outline.patches.objects.filter(patch_is_applied=False).order_by('sequence').all()
        json_document = outline.document
        patches_applied = []
        for patch_data in patches:
            try:
                jsonpatch.apply_patch(json_document, patch_data.rfc_6902_patch, in_place=True)
                patches_applied.append(patch_data.sequence)
                patch_data.patch_is_applied = True
                patch_data.save()
            except Exception as ex:
                logger.exception(ex)
        try:
            outline.document = json_document
            outline.latest_patch_sequence = max(patches_applied)
            outline.save()
        except Exception as ex:
            logger.exception(ex)

@shared_task
def upload_new_ooxml_document(file_data, filename, user_id, ooxml_id):
    logger.error("create file upload process")
    logger.info("user_id: {0}, ooxml_id: {1}, filename: {2}, \n\r filedata: {3}".format(user_id, ooxml_id, filename, file_data))





    