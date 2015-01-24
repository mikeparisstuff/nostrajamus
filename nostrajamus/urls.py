from django.conf.urls import patterns, include, url
from django.contrib import admin
from rest_framework import routers
from api import views
from django.contrib.staticfiles.urls import staticfiles_urlpatterns



router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)
router.register(r'contests', views.ContestViewSet)
router.register(r'tracks', views.TrackViewSet)
router.register(r'playcounts', views.PeriodicPlayCountViewSet)
router.register(r'scusers', views.SCUserViewSet)
router.register(r'contest_entries', views.ContestEntryViewSet)
router.register(r'feedback', views.FeedbackViewSet)
router.register(r'contest_ideas', views.ContestIdeaViewSet)

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'nostrajamus.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^login/', views.LoginView.as_view(), name="login"),
    url(r'^logout/', views.LogoutView.as_view(), name="logout"),
    url(r'^api/', include(router.urls)),
    url(r'^contests/', views.Contest1View.as_view(), name='contest_1'),
    url(r'^api-auth/', include('rest_framework.urls',namespace='rest_framework')),
    url(r'^', views.HomePageView.as_view(), name='home_page'),
)

urlpatterns += staticfiles_urlpatterns()