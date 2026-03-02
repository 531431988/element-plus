import request from '@/utils/http'

// 获取用户列表
export function fetchGetUserList(params: Api.SystemManage.UserSearchParams) {
  return request.get<Api.SystemManage.UserList>({
    url: '/c2m/sys/user/page',
    params
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

// 删除用户
export function fetchDeleteUser(params: Api.SystemManage.DeleteUserParams) {
  return request.del<Api.SystemManage.DeleteUserResponse>({
    url: '/c2m/sys/user/remove',
    params
  })
}
