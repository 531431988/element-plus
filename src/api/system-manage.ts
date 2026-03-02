import request from '@/utils/http'
import { AppRouteRecord } from '@/types/router'

// 获取用户列表
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  return request.get<Api.SystemManage.UserList>({
    url: '/c2m/sys/user/page',
    params
  })
}

// 获取角色列表
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.SystemManage.RoleList>({
    url: '/api/role/list',
    params
  })
}

// 获取菜单列表
export function fetchGetMenuList() {
  return request.get<AppRouteRecord[]>({
    url: '/c2m/menu/all'
  })
}

// 更新用户锁定状态（启用）
export function fetchUpdateUserLocked(params: Api.SystemManage.UpdateLockedParams) {
  return request.post<Api.SystemManage.UpdateLockedResponse>({
    url: '/c2m/sys/user/locked',
    params
  })
}

// 更新用户解锁状态（禁用）
export function fetchUpdateUserUnLocked(params: Api.SystemManage.UpdateLockedParams) {
  return request.post<Api.SystemManage.UpdateLockedResponse>({
    url: '/c2m/sys/user/unLocked',
    params
  })
}

// 新增用户
export function fetchSaveUser(params: Api.SystemManage.SaveUserParams) {
  return request.post<Api.SystemManage.SaveUserResponse>({
    url: '/c2m/sys/user/save',
    params
  })
}

// 更新用户（编辑）
export function fetchUpdateUser(params: Api.SystemManage.SaveUserParams) {
  return request.put<Api.SystemManage.SaveUserResponse>({
    url: '/c2m/sys/user/update',
    params
  })
}
