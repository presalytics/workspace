import Auth0Plugin from '@/plugins/auth0'
import Dispatcher from '@/plugins/dispatcher'
import HttpPlugin from '@/plugins/http'
import { Store } from 'vuex'

declare module 'vue/types/vue' {
  interface Vue{
    $auth: Auth0Plugin
    $dispatcher: Dispatcher
    $http: HttpPlugin
    $store: Store
  }
}