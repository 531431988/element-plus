import request from '@/utils/http'

// 获取字典分类列表
export function fetchGetDictTypeList(params?: any) {
  return request.get<Api.SystemManage.DictTypeList>({
    url: '/c2m/sys/dict/page',
    params
  })
}

// 获取字典项列表
export function fetchGetDictItemList(
  params: { dictId: number | string } & Api.Common.PaginationParams
) {
  return request.get<Api.SystemManage.DictItemList>({
    url: '/c2m/sys/dictItem/page',
    params
  })
}

// 更新字典项（启用/停用）
export function fetchUpdateDictItem(params: any) {
  return request.put({
    url: '/c2m/sys/dictItem/update',
    params
  })
}
