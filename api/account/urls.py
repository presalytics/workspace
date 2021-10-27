from django.conf.urls import url
from django.urls import path
from . import views


app_name = 'accounts'


urlpatterns = [
    path('', views.AccountListCreateView.as_view(), name='accounts'),
    path('<uuid:pk>', views.AccountGetEditDeleteView.as_view(), name='account_update'),
    path('plan', views.AccountPlanListCreateView.as_view(), name="plans"),
    path('plan/<uuid:pk>', views.AccountPlanGetEditDeleteView.as_view(), name='plans_update'),
    path('features', views.FeaturesListCreateView.as_view(), name='features'),
    path('features/<uuid:pk>', views.FeaturesGetEditDeleteView.as_view(), name='features_update')

]