# 公告计划接口文档

## 基础路径
```
/system/announcement
```

---

# 一、后台管理接口

## 1. 获取公告计划

### URL
```
GET /system/announcement/announcement
```

### 请求参数
无

### 响应参数
```json
{
  "code": 200,
  "msg": "查询成功",
  "data": {
    "content": "这是公告内容",
    "updateTime": "2024-01-01 12:00:00"
  }
}
```

### 响应字段说明
| 字段名 | 类型 | 说明 |
|--------|------|------|
| code | Integer | 状态码，200表示成功 |
| msg | String | 响应消息 |
| data | Object | 公告信息对象 |
| content | String | 公告内容 |
| updateTime | String | 更新时间 |

## 2. 修改公告计划

### URL
```
POST /system/announcement/update
```

### 请求参数
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| content | String | 是 | 公告内容 |

### 响应参数
```json
{
  "code": 200,
  "msg": "操作成功"
}
```

### 响应字段说明
| 字段名 | 类型 | 说明 |
|--------|------|------|
| code | Integer | 状态码，200表示成功 |
| msg | String | 响应消息 |