from django.db import models
from datetime import datetime
from django.core.urlresolvers import reverse
from django.template.defaultfilters import slugify
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password, make_password

class TimeStampedModel(models.Model):
    created = models.DateTimeField(auto_now_add = True)
    modified = models.DateTimeField(auto_now_add = True)

    class Meta:
        abstract = True

class CustomUser(TimeStampedModel):
    firstname = models.CharField(max_length = 50)
    lastname = models.CharField(max_length = 50)
    email = models.EmailField(blank = True)
    custom_user = models.ForeignKey(User, related_name = 'customuser_related')
    username = models.CharField(max_length = 50)

    def __unicode__(self):
        return self.custom_user.username

    def get_absolute_url(self):
        return reverse('user_profile', kwargs = {'slug':self.id})


class PrivateMessage(TimeStampedModel):
    sender = models.ForeignKey(CustomUser, related_name = 'sender')
    receiver = models.ManyToManyField(CustomUser, related_name = 'receiver')
    read_by = models.ManyToManyField(CustomUser, related_name = 'read_by')
    title = models.CharField(max_length = 100)
    body = models.TextField()

    def is_read(self, CustomUser):
        return CustomUser in self.read_by.all()


class MasterForum(models.Model):
    forum_name = models.CharField(max_length = 200)
    slug = models.SlugField()
    members = models.ManyToManyField(CustomUser, related_name = 'masterforum_related')
    password = models.CharField(max_length = 200)
    password2 = models.CharField(max_length = 200, blank = True)
    moderators = models.ManyToManyField(CustomUser)

    def __unicode__(self):
        return self.forum_name

    def is_member(self, customuser):
        return customuser in self.members.all()

    def get_absolute_url(self):
        return reverse('masterview', kwargs = {'slug':self.slug})

    def new_password(self, **kwargs):
        self.password = make_password(kwargs['password'])
        self.save()
        return

    def save(self, *args, **kwargs):
        if not self.id:
            self.password = make_password(self.password)
            self.password2 = ''
            super(MasterForum, self).save(*args, **kwargs)
            new_slug = '/'.join([base62_encode(self.id), slugify(self.forum_name)])
            self.slug = new_slug
            super(MasterForum, self).save(*args, **kwargs)
        else:
            pass
#            super(MasterForum, self).save(*args, **kwargs)

class CalendarEvent(models.Model):
    title = models.CharField(max_length = 100)
    description = models.CharField(max_length = 200)
    start = models.DateField()
    end = models.DateField()
    in_master_forum = models.ForeignKey(MasterForum, related_name = 'in_forum')
    created_by = models.ForeignKey(CustomUser, related_name = 'creator')
    
    def __unicode__(self):
        return self.title

class UserPermissions(models.Model):
    MASTER = 'MA'
    GENERAL = 'GN'
    USER = 'US'
    PERMISSION_CHOICES = (
        (MASTER, 'MASTER'),
        (GENERAL, 'GENERAL'),
        (USER, 'USER'),
        )

    custom_user = models.ForeignKey(CustomUser, related_name = 'permissions_user')
    master_forum = models.ForeignKey(MasterForum, related_name = 'permissions_forum')
    permissions = models.CharField(max_length = 2, choices = PERMISSION_CHOICES, default = USER)
    forum_username = models.CharField(max_length = 50)

class SubForum(models.Model):
    sub_forum_name = models.CharField(max_length = 200)
    description = models.CharField(max_length = 200)
    in_master_forum = models.ForeignKey(MasterForum, related_name = 'subforums')
    slug = models.SlugField()

    def __unicode__(self):
        return self.sub_forum_name

    def is_member(self, customuser):
        return customuser in self.in_master_forum.members.all()

    def get_latest_post(self):
        latest_post = Post()
        if not self.thread_set.all()[0].created == None:
            latest_post = self.thread_set.all()[0]
        for threads in self.thread_set.all():
            post = threads.get_latest_post()
            if latest_post.created < post.created:
                latest_post = post
        return latest_post

    def get_absolute_url(self):
        return reverse('subview', kwargs = {'slug': self.slug})

    def save(self, *args, **kwargs):
        if not self.id:
            super(SubForum, self).save(*args, **kwargs)
#            new_slug = '/'.join([self.in_master_forum.slug, slugify(self.sub_forum_name)])
#            self.slug = new_slug
#            super(SubForum, self).save(*args, **kwargs)
        else:
            super(SubForum, self).save(*args, **kwargs)

class Thread(TimeStampedModel):
    thread_name = models.CharField(max_length = 200)
    description = models.CharField(max_length = 200)
    in_subforum = models.ForeignKey(SubForum)
    slug = models.SlugField()
    created_by = models.ForeignKey(CustomUser)
    views = models.IntegerField(default = 0)
    latest_post = models.ForeignKey('Post', blank = True, null= True)

    def is_member(self, customuser):
        return customuser in self.in_subforum.in_master_forum.members.all()

    def get_unread_post_count(self, **kwargs):
        return Post.objects.filter(in_thread = self).exclude(viewed_by = kwargs['user']).count()

    def get_post_count(self, **kwargs):
        return Post.objects.filter(in_thread = self).count()

    def get_latest_post(self):
        return self.latest_post
#        return Post.objects.filter(in_thread = self).latest()

    def get_absolute_url(self):
        return reverse('threadview', kwargs = {'slug': self.slug})
    
 #   def save(self, *args, **kwargs):
 #       if not self.id:
 #           super(Thread, self).save(*args, **kwargs)
 #           new_slug = '/'.join([base62_encode(self.id), self.in_subforum.slug, slugify(self.thread_name)])
 #           self.slug = new_slug
 #           self.modified = datetime.now()
 #           super(Thread, self).save(*args, **kwargs)
 #       else:
 #           pass
  #          super(Thread, self).save(*args, **kwargs)

    def __unicode__(self):
        return self.thread_name


class Post(TimeStampedModel):
    title = models.CharField(max_length = 200)
    post_body = models.TextField()
    in_thread = models.ForeignKey(Thread)
    slug = models.SlugField()
    created_by = models.ForeignKey(CustomUser, related_name = 'post_created_by')
    viewed_by = models.ManyToManyField(CustomUser, blank=True, null=True, related_name = 'post_viewed_by')
    edited_by = models.ForeignKey(CustomUser, blank=True, null=True)
    
    def __unicode__(self):
        return self.title

    def get_absolute_url(self):
        return '%s?page=last#post%s' % (self.in_thread.get_absolute_url(), self.id)

    def save(self, *args, **kwargs):
        if not self.id:
            super(Post, self).save(*args, **kwargs)
            new_slug = '/'.join([self.in_thread.slug, base62_encode(self.id), slugify(self.title)])
            self.slug = new_slug
            self.in_thread.modified = self.created
            self.in_thread.views -=1
            self.in_thread.latest_post = self
            self.in_thread.save()
            super(Post, self).save(*args, **kwargs)
        else:
            pass
            super(Post, self).save(*args, **kwargs)
    
    class Meta:
        get_latest_by = 'created'
        


def base62_encode(num):
    """Encode a number in Base X
    `num`: The number to encode
    `alphabet`: The alphabet to use for encoding
    """
    alphabet = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if (num == 0):
        return alphabet[0]
    arr = []
    base = 62
    while num:
        rem = num % 62
        num = num // 62
        arr.append(alphabet[rem])
    return ''.join(arr)

