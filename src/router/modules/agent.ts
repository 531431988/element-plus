import { AppRouteRecord } from '@/types/router'

export const agentRoutes: AppRouteRecord = {
  path: '/template/agent',
  name: 'Agent',
  component: '/template/agent/index',
  meta: {
    title: '智能体',
    icon: 'ri:apps-2-line'
  },
  children: [
    {
      path: 'chat',
      name: 'Chat',
      component: '/agent/chat',
      meta: {
        title: '智能体对话',
        icon: 'ri:message-3-line',
        keepAlive: true,
        isFullPage: true
      }
    }
  ]
}
