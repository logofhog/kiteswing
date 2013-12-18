from django.contrib import admin
from forum.models import *
admin.site.register(MasterForum)
admin.site.register(SubForum)
admin.site.register(CustomUser)
admin.site.register(Thread)
admin.site.register(Post)
admin.site.register(UserPermissions)
admin.site.register(CalendarEvent)
admin.site.register(PrivateMessage)
