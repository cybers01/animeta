import json

from api.serializers import serialize_work
from api.v2 import BaseView
from search.models import WorkIndex
from work.models import Work, TitleMapping, normalize_title


# TODO: auth


class WorksView(BaseView):
    def get(self, request):
        only_orphans = request.GET.get('orphans') == '1'
        offset = int(request.GET.get('offset', 0))
        limit = 50
        queryset = Work.objects.order_by('-id')
        if only_orphans:
            queryset = queryset.filter(index__record_count=0)
        return map(serialize_work, queryset[offset:offset+limit])


def serialize_title_mapping(mapping):
    return {
        'id': mapping.id,
        'title': mapping.title,
        'record_count': mapping.count,
    }


class WorkView(BaseView):
    def get(self, request, id):
        work = Work.objects.get(pk=id)
        title_mappings = list(work.title_mappings.all())
        for mapping in title_mappings:
            mapping.count = mapping.record_count
        title_mappings.sort(key=lambda m: m.count, reverse=True)
        try:
            index = work.index
        except WorkIndex.DoesNotExist:
            index = None
        return {
            'id': work.id,
            'title': work.title,
            'image_filename': work.image_filename,
            'raw_metadata': work.raw_metadata,
            'metadata': work.metadata,
            'title_mappings': map(serialize_title_mapping, title_mappings),
            'index': {
                'record_count': work.index.record_count,
                'rank': work.index.rank,
            } if index else None,
        }

    def post(self, request, id):
        payload = json.loads(request.body)
        if 'primaryTitleMappingId' in payload:
            mapping = TitleMapping.objects.get(pk=payload['primaryTitleMappingId'])
            mapping.work.title = mapping.title
            mapping.work.save()
        return self.get(request, id)

    def delete(self, request, id):
        work = Work.objects.get(pk=id)
        assert work.record_set.count() == 0
        work.delete()
        return {'ok': True}


class WorkTitleMappingsView(BaseView):
    def post(self, request, id):
        payload = json.loads(request.body)
        work = Work.objects.get(pk=id)
        title = payload['title'].strip()
        key = normalize_title(title)
        if TitleMapping.objects.filter(key=key).exclude(work=work).count() > 0:
            raise Exception
        created = TitleMapping.objects.create(
            work=work,
            title=title,
            key=normalize_title(title),
        )
        created.count = 0
        return serialize_title_mapping(created)


class TitleMappingView(BaseView):
    def delete(self, request, id):
        mapping = TitleMapping.objects.get(pk=id)
        if mapping.record_count == 0:
            mapping.delete()
        return {'ok': True}
