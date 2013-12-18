from django.views.generic import TemplateView, View
from rest_framework import generics
from .models import *
from serializers import * 
from rest_framework import viewsets
from rest_framework import renderers, serializers, status
from rest_framework.response import Response
from rest_framework.renderers import TemplateHTMLRenderer

from StringIO import StringIO
from rest_framework.parsers import JSONParser
import json
from rest_framework.decorators import action, link
from django.http import HttpResponse, HttpResponseRedirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.hashers import check_password
from rest_framework import permissions
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.shortcuts import get_object_or_404, redirect
from django.core.exceptions import PermissionDenied
from django.core.paginator import Paginator
from .permissions import ModPermission
import datetime

class MembershipRequiredMixin(object):
    def is_member(self, obj):
        if not obj.is_member(self.request.user.customuser_related.get()):
            raise PermissionDenied

class HomeViewSet(viewsets.ViewSet):
    queryset = MasterForum.objects.all();
    def retrieve(self, request, pk=None):
        toreturn = {};
        queryset = MasterForum.objects.get(pk=pk);
        latest_posts = []
        sub_threads = []
        for sub in queryset.subforums.all():
            for thread in sub.thread_set.all().order_by('-latest_post')[:10]:
                if len(latest_posts) < 10:
                    latest_posts.append(thread)
                else:
                    for index, t in enumerate(latest_posts):
                        if latest_posts[index].latest_post.created < thread.latest_post.created:
                            latest_posts.pop()
                            latest_posts.insert(index, thread)
                            break
        for i, e in enumerate(latest_posts):
            if e.in_subforum.sub_forum_name in toreturn:
                toreturn[e.in_subforum.sub_forum_name]['threads'].append(ThreadSerializer(e).data)
            else:
                toreturn[e.in_subforum.sub_forum_name] = {'sub_name':e.in_subforum.sub_forum_name, 'threads':[ThreadSerializer(e).data]}
        toreturn = {'masterforum':queryset.forum_name, 'subs':toreturn}

        event_list = CalendarEvent.objects.filter(in_master_forum = queryset)
        event_list = event_list.filter(start__gte = datetime.datetime.now()).order_by('start')[:5]
        toreturn['events'] = CalendarSerializer(event_list).data
        is_mod = self.request.user.customuser_related.get() in queryset.moderators.all()
        toreturn['is_mod'] = is_mod
        return Response(toreturn)


class PrivateMessageViewSet(viewsets.ModelViewSet):
    model = PrivateMessage
    serializer_class = PrivateMessageSerializer
    permission_classes = (IsAuthenticated,)

    def list(self, request):
        messages = PrivateMessage.objects.filter(receiver = self.request.user.customuser_related.get()).order_by('-created')
        serialized = PrivateMessageSerializer(messages, context = {'request': request})
        return Response(serialized.data)

    @action()
    def markasread(self, request, pk = None):
        message = PrivateMessage.objects.get(pk = pk)
        message.read_by.add(self.request.user.id)
        return Response() 

    @action()
    def deletemessage(self, request, pk= None):
        message = PrivateMessage.objects.get(pk = pk)
        message.receiver.remove(self.request.user.id)
        return Response()



    def create(self, request):
        if request.method == 'POST':
            data = self.request.DATA
            data['sender'] = str(request.user.id)
            try:
                receiver = CustomUser.objects.get(username = data['receiver'])
            except:
                return Response({'error':'User does not exist'}, status = status.HTTP_400_BAD_REQUEST)
            data['receiver'] = (receiver.id,)
            serialized = NewPrivateMessageSerializer(data = data)
            if serialized.is_valid():
                serialized.save()
        return Response()


class CalendarViewSet(MembershipRequiredMixin, viewsets.ModelViewSet):
    model = CalendarEvent
    serializer = CalendarSerializer

    def retrieve(self, request, pk=None):
        in_master_forum = MasterForum.objects.get(pk = self.kwargs['pk'])
        self.is_member(in_master_forum)
        event_list = CalendarEvent.objects.filter(in_master_forum = in_master_forum)
        start = request.QUERY_PARAMS['start']
        start = datetime.datetime.fromtimestamp(int(start))
        end = request.QUERY_PARAMS['end']
        end = datetime.datetime.fromtimestamp(int(end)).strftime('%Y-%m-%d')
        event_list = event_list.filter(start__range = [start, end])
        serializer = CalendarSerializer(event_list)
        return Response(serializer.data)

    def create(self, request):
        if request.method == 'POST':
            data = self.request.DATA
            data['created_by'] = self.request.user.id
            serialized = CalendarSerializer(data = data)
            if serialized.is_valid():
                serialized.save()
        return Response()
    
    def pre_save(self, obj):
        obj.created_by_id = self.request.user.id
        obj.save()

class ForumAdminViewSet(viewsets.ModelViewSet):
    model = MasterForum 
    serializer = ForumAdminSerializer
    permission_classes = (ModPermission,)

    @link(permission_classes = [ModPermission])
    def getmods(self, request, pk=None):
        self.check_object_permissions(request, self.get_object())
        queryset = MasterForum.objects.get(pk = pk).moderators.all()
        serialized = CustomUserSerializer(queryset, many=True)
        return Response(serialized.data)

    @action(permission_classes = [ModPermission])
    def editmods(self, request, pk=None):
        self.check_object_permissions(request, self.get_object())
        action = request.DATA['action']
        if action == 'add':
            mod_to_add = User.objects.get(username = request.DATA['username']).customuser_related.get()
            MasterForum.objects.get(pk = pk).moderators.add(mod_to_add)
        if action == 'remove':
            mod_to_delete = User.objects.get(username = request.DATA['username']).customuser_related.get()
            MasterForum.objects.get(pk = pk).moderators.remove(mod_to_delete)
            
        return Response('edited mods')

    @action()
    def makesub(self, request, pk = None):
        self.check_object_permissions(request, self.get_object())
        serialized = SubForumSerializer(data = request.DATA)
        if serialized.is_valid():
            serialized.save()
        return Response('boot')
    
    @action()
    def editmembers(self, request, pk=None):
        return Response('logged out')

    @link()
    def getmembers(self, request, pk=None):
        queryset = MasterForum.objects.get(pk=pk).members.all()
        serialized = CustomUserSerializer(queryset, many=True)
        return Response(serialized.data)

class Index(TemplateView):
    template_name = 'forum/index.html'

    def get_context_data(self, **kwargs):
        context = super(Index, self).get_context_data(**kwargs)
        if self.request.user.is_anonymous():
            context['is_logged_in'] = False
        else:
            context['is_logged_in'] = True
        return context


class ForumViewSet(viewsets.ModelViewSet):
    model = MasterForum
    serializer_class = ForumSerializer
    permission_classes = (IsAuthenticated,)
    
    def get_queryset(self, **kwargs):
        user = self.request.user.customuser_related.get()
        queryset = user.masterforum_related.all()
        return queryset

    def create(self, request):
        serializer = MakeNewForumSerializer(data = self.request.DATA)

        if serializer.is_valid():
            creator = self.request.user.customuser_related.get()
            self.object = serializer.save()
            self.object.members.add(creator)
            self.object.moderators.add(creator)
            headers = self.get_success_headers(serializer.data)
            return Response(status = status.HTTP_201_CREATED, headers = headers)
        return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)

    def pre_save(self, obj):
        obj.members = self.request.user.customuser_related.get()


class SubForumViewSet(MembershipRequiredMixin, viewsets.ModelViewSet):
    model = SubForum
    serializer_class = SubForumSerializer

    def retrieve(self, request, pk=None):
        in_master = MasterForum.objects.get(pk = self.kwargs['pk'])
        in_master.is_member(self.request.user.customuser_related.get())
        sub_list = SubForum.objects.filter(in_master_forum = in_master)
        sorted(sub_list, key = lambda a: a.get_lastest_post)
        serializer = SubForumSerializer(sub_list)
        return Response(serializer.data)


class ThreadViewSet(MembershipRequiredMixin, viewsets.ModelViewSet):
    model = Thread
    serializer_class = NewThreadSerializer

    def retrieve(self, request, pk=None):
        in_subforum = SubForum.objects.get(pk = self.kwargs['pk'])
        self.is_member(in_subforum)
        thread_list = Thread.objects.filter(in_subforum = in_subforum).order_by('-latest_post')
        paginator = Paginator(thread_list, 20)
        page = paginator.page(request.QUERY_PARAMS.get('page'))
        serializer = PaginatedThreadSerializer(page, context = {'request':request})
        return Response(serializer.data)

    def pre_save(self, obj):
        obj.created_by_id = self.request.user.id


class PostViewSet(MembershipRequiredMixin, viewsets.ModelViewSet):
    model = Post
    serializer_class = PostSerializer
    permission_classes = (IsAuthenticated,)

    def create(self, request):
        if request.method == 'POST':
            data = self.request.DATA
            if data['id'] != 'new':
                post = Post.objects.get(pk=data['id'])
                post_body = data['post_body'] + '</br><i> edited by ' + self.request.user.username + ' on ' + datetime.datetime.now().strftime('%m-%d at %H:%M') + '</i>'
                post.post_body = post_body
                post.save()
                return Response()
            else:
                data['created_by'] = self.request.user.id
                serialized = NewPostSerializer(data = data)
            if serialized.is_valid():
                serialized.save()
                serialized.object.in_thread.latest_post = serialized.object
                serialized.object.in_thread.save()
        return Response()

    @action()
    def edit_post(self, request, pk=None):
        post = Post.objects.get(pk = pk)
        return Response()

    def retrieve(self, request, pk=None):
        in_thread = Thread.objects.get(pk =self.kwargs['pk'])
        self.is_member(in_thread)
        post_list = Post.objects.filter(in_thread = in_thread)
        paginator = Paginator(post_list, 10)
        page = paginator.page(request.QUERY_PARAMS.get('page'))
        serializer = PaginatedPostSerializer(page)
        in_master = in_thread.in_subforum.in_master_forum
        if self.request.user.customuser_related.get() in in_master.moderators.all():
            is_mod = True
        else:
            is_mod = False
        serializer.data['is_mod'] = is_mod
        serializer.data['user'] = self.request.user.username
        return Response(serializer.data)

    def pre_save(self, obj):
        obj.created_by_id = self.request.user.id

    def post_save(self, obj, created = False):
        obj.in_thread.latest_post = obj
        obj.in_thread.save(update_fields = ['latest_post',])


class ForumDetail(generics.RetrieveUpdateDestroyAPIView):
    model = MasterForum
    serializer_class = ForumSerializer


class SubForumList(generics.ListCreateAPIView):
    model = SubForum
    serializer_class = SubForumSerializer


class AccountsViewSet(viewsets.ModelViewSet):
    model = User
    serializer_class = RegisterSerializer
    queryset = User.objects.all()

    @action(permission_classes =(AllowAny,))
    def register_user(self, request,pk = None):
        serializer = MakeNewUserSerializer(data = self.request.DATA)

        if serializer.is_valid():
            try: 
                new_user = User.objects.create_user(username = serializer.data['username'], password = serializer.data['password'])
                new_custom_user = CustomUser(custom_user = new_user, username = new_user.username)
                new_custom_user.save()
                user = authenticate(username = serializer.data['username'], password = serializer.data['password'])
                login(request, user)
            except:
                return Response(data = {'error':'Username taken'}, status = status.HTTP_400_BAD_REQUEST) 
            headers = self.get_success_headers(serializer.data)
            return Response(data = {'is_logged_in': True}, status = status.HTTP_201_CREATED, headers = headers)
        return Response(serializer.errors, status = status.HTTP_400_BAD_REQUEST)

    @action(permission_classes = (AllowAny,))
    def LoginUser(self, request, pk = None):
        permission_classes = (AllowAny,)
        if request.method == 'POST':
            username = request.DATA['username']
            password = request.DATA['password']
            try:
                user = User.objects.get(username = username)
            except:
                return Response(data = {'error':'user/password not valid'}, status = status.HTTP_400_BAD_REQUEST)
            if user is not None:
                user = authenticate(username = username, password = password)
                if user is not None:
                    login(request, user)
                    return Response('logged in')
                else:
                    return Response(data = {'error':'user/password not valid'}, status = status.HTTP_400_BAD_REQUEST)
            else:    
                return Response(serializer.errors)

    @link()
    def Logout(self, request, pk=None):
        context = {}
        context['is_logged_in'] = False
        logout(request)
        return HttpResponse(content = context)
       # logout(request)
        

    @link()
    def GetUser(self, request, pk = None):
        cuser = self.request.user.customuser_related.get()
        serialized = CustomUserSerializer(cuser)

        return Response(serialized.data)

    @action(permission_classes = (IsAuthenticated,))
    def JoinForum(self, request, pk = None):
        user = request.user.customuser_related.get();
        password = request.DATA['password']
        try:
            forum_to_join = MasterForum.objects.get(forum_name = request.DATA['forum_name'])
        except:
            return Response(data={'error':'Name/Password Invalid'}, status = status.HTTP_400_BAD_REQUEST)
        if check_password(password, forum_to_join.password):
            forum_to_join.members.add(user)
        else:
            return Response(data={'error':'Name/Password Invalid'}, status = status.HTTP_400_BAD_REQUEST)
        return Response('success') 

class CustomUserViewSet(viewsets.ModelViewSet):
    model = CustomUser
    serializer_class = CustomUserSerializer        
    permission_classes = (IsAuthenticated,)

    def get_queryset(self, **kwargs):
        queryset = self.request.user.customuser_related.all()
        messages = PrivateMessage.objects.filter(receiver = self.request.user.customuser_related.get()).order_by('-created')
        return queryset

    @link()
    def get_messages(self, request, pk=None):
        user = self.request.user.customuser_related.get()
        unread_messages = PrivateMessage.objects.filter(receiver = user).exclude(read_by = user).count()
        return Response(unread_messages)

class UserViewSet(viewsets.ModelViewSet):
    model = User
    serializer_class = UserSerializer        
    permission_classes = (IsAuthenticated,)
