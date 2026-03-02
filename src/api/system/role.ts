import request from '@/utils/http'

// 获取角色列表
export function fetchGetRoleList(params: Api.SystemManage.RoleSearchParams) {
  return request.get<Api.SystemManage.RoleList>({
    url: '/c2m/sys/role/page',
    params
  })
}

// 启用角色
export function fetchEnableRole(params: { id: string }) {
  return request.post({
    url: '/c2m/sys/role/onRole',
    params
  })
}

// 禁用角色
export function fetchDisableRole(params: { id: string }) {
  return request.post({
    url: '/c2m/sys/role/unRole',
    params
  })
}

// 删除角色
export function fetchDeleteRole(params: { id: string }) {
  return request.del({
    url: '/c2m/sys/role/remove',
    params
  })
}

// 新增角色
export function fetchSaveRole(params: Api.SystemManage.SaveRoleParams) {
  return request.post<Api.SystemManage.SaveRoleResponse>({
    url: '/c2m/sys/role/save',
    params
  })
}

// 更新角色
export function fetchUpdateRole(params: Api.SystemManage.UpdateRoleParams) {
  return request.put<Api.SystemManage.SaveRoleResponse>({
    url: '/c2m/sys/role/update',
    params
  })
}
