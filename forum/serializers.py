from django.forms import widgets
from rest_framework import serializers, pagination
from rest_framework.serializers import RelatedField, HyperlinkedIdentityField, HyperlinkedRelatedField
from forum.models import *
from django.contrib.auth.models import User
from rest_framework.pagination import PaginationSerializer

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields  = ('firstname', 'lastname', 'email', 'username')


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('email', 'firstname', 'lastname', 'username', 'id')


class CalendarSerializer(serializers.ModelSerializer):
    class Meta:
        model = CalendarEvent
        fields = ('title', 'description', 'start', 'end', 'in_master_forum', 'created_by')


class NewPrivateMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrivateMessage
        fields = ('title', 'body', 'created', 'sender', 'receiver')


class PrivateMessageSerializer(serializers.ModelSerializer):
    sender = CustomUserSerializer()
    receiver = CustomUserSerializer()
    is_read = serializers.BooleanField()
    is_read = serializers.SerializerMethodField('get_is_read')

    class Meta:
        model = PrivateMessage
        fields = ('id', 'title', 'body', 'created', 'sender', 'receiver', 'is_read')
    
    def get_is_read(self, obj):
        # self.context['request'].user
        if self.context['request'].user.customuser_related.get() in obj.read_by.all():
            return True
        else:
            return False

class SubForumSerializer(serializers.ModelSerializer):
#    in_master_forum = serializers.HyperlinkedIdentityField(view_name = 'ForumDetail', format = 'html')

    class Meta:
        model = SubForum
        fields = ('id', 'in_master_forum', 'sub_forum_name')

class ForumSerializer(serializers.ModelSerializer):
    subforums = SubForumSerializer()
#    subforums = serializers.RelatedField(many = True);
    class Meta:
        model = MasterForum
        fields = ('id', 'forum_name', 'subforums')

class MakeNewForumSerializer(serializers.ModelSerializer):
#    forum_name = serializers.CharField(max_length = 200)
#    password = serializers.CharField(max_length = 200)
#    password2 = serializers.CharField(max_length = 200)
#
    class Meta:
        model = MasterForum
        fields = ('forum_name', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] == attrs['password2']:
            return attrs
        else:
            raise serializers.ValidationError('passwords dont match')


class PostSerializer(serializers.ModelSerializer):
    created_by = UserSerializer()

    class Meta:
        model = Post
        fields = ('id', 'post_body', 'title', 'in_thread','created', 'created_by')

class LatestPostSerializer(serializers.ModelSerializer):
    created_by = UserSerializer()

    class Meta:
        model = Post
        fields = ('created', 'created_by')

class ThreadSerializer(serializers.ModelSerializer):
    created_by = UserSerializer()
    post_count = serializers.SerializerMethodField('get_post_count')
#    unread = serializers.SerializerMethodField('get_is_unread')
#    latest_post = serializers.SerializerMethodField('get_latest_post')
    latest_post = LatestPostSerializer()

    class Meta:
        model = Thread
        fields = ('id', 'thread_name', 'in_subforum', 'created_by', 'created', 'post_count', 'latest_post')
 
    def get_post_count(self, obj):
        return obj.get_post_count()

#    def get_latest_post(self, obj):
#       return {'created': obj.latest_post.created, 'created_by':obj.latest_post.created_by}


class PaginatedThreadSerializer(pagination.PaginationSerializer):
    class Meta:
        object_serializer_class = ThreadSerializer

class NewThreadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Thread
        fields = ('id', 'thread_name', 'in_subforum')


class NewPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ('id', 'post_body', 'title', 'in_thread','created', 'created_by')


class PaginatedPostSerializer(pagination.PaginationSerializer):
    class Meta:
        object_serializer_class = PostSerializer


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(max_length = 200)
    password = serializers.CharField(max_length = 200)

           
class RegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ('username', 'password', 'email')

class MakeNewUserSerializer(serializers.Serializer):
    username = serializers.CharField(max_length = 200)
    password = serializers.CharField(max_length = 200)
     

class ForumAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterForum
        fields = ('forum_name', 'members', 'moderators')
