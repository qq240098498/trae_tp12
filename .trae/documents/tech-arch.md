## 1. 架构设计

```mermaid
flowchart LR
    A["前端 React SPA"] --> B["React Router 路由层"]
    B --> C["页面组件层"]
    C --> D["业务组件层"]
    D --> E["状态管理 (Zustand)"]
    E --> F["Mock 数据层 (localStorage)"]
    F --> G["浏览器本地存储"]
```

## 2. 技术描述
- **前端框架**：React@18 + TypeScript
- **构建工具**：Vite@5
- **样式方案**：TailwindCSS@3 + CSS 变量
- **路由管理**：React Router@6
- **状态管理**：Zustand（轻量、简洁）
- **图标库**：Lucide React
- **数据存储**：localStorage 持久化 + Mock 数据
- **动画库**：Framer Motion

## 3. 路由定义
| 路由 | 用途 |
|------|------|
| / | 首页仪表板 |
| /pets | 宠物列表 |
| /pets/new | 新增宠物登记 |
| /pets/:id | 宠物详情/爱好建档 |
| /pets/:id/profile | 宠物爱好建档编辑 |
| /routes | 运输路线管理 |
| /routes/new | 新增运输路线 |
| /pricing | 基础价格维护 |
| /vehicles | 车辆管理 |
| /vehicles/new | 新增车辆 |
| /orders | 订单列表 |
| /orders/new | 计费下单 |
| /orders/:id | 订单详情/运输流程 |
| /dispatch | 运输调度（员工接单） |
| /employees | 员工管理 |

## 4. 数据模型

### 4.1 实体关系图

```mermaid
erDiagram
    PET ||--o{ PET_PROFILE : has
    PET ||--o{ ORDER : "placed by"
    CUSTOMER ||--o{ PET : owns
    CUSTOMER ||--o{ ORDER : places
    ROUTE ||--o{ ORDER : uses
    VEHICLE ||--o{ ORDER : assigned_to
    EMPLOYEE ||--o{ ORDER : handles
    PRICING_RULE ||--o{ ORDER : applied_to

    PET {
        uuid id PK
        string name
        string species
        string breed
        number age
        string gender
        number weight_kg
        string photo_url
        uuid customer_id FK
        datetime created_at
    }

    PET_PROFILE {
        uuid id PK
        uuid pet_id FK
        string diet_habit
        string sleep_schedule
        string special_needs
        string medical_info
        string temperament
        string favorite_toys
        text notes
    }

    CUSTOMER {
        uuid id PK
        string name
        string phone
        string address
    }

    ROUTE {
        uuid id PK
        string origin
        string destination
        number distance_km
        number duration_hours
        number base_price
        boolean is_active
    }

    VEHICLE {
        uuid id PK
        string plate_number
        string vehicle_type
        number capacity
        string status
        string driver_name
        string driver_phone
    }

    EMPLOYEE {
        uuid id PK
        string name
        string employee_no
        string phone
        string role
        boolean is_available
    }

    PRICING_RULE {
        uuid id PK
        string vehicle_type
        string pet_species
        number weight_min
        number weight_max
        number price_per_km
        number surcharge
    }

    ORDER {
        uuid id PK
        string order_no
        uuid pet_id FK
        uuid customer_id FK
        uuid route_id FK
        uuid vehicle_id FK
        uuid employee_id FK
        number base_price
        number surcharge
        number total_price
        string status
        datetime pickup_time
        datetime delivery_time
        string receiver_name
        string receiver_phone
        number satisfaction
        text remark
        datetime created_at
        datetime updated_at
    }

    ORDER_STATUS_LOG {
        uuid id PK
        uuid order_id FK
        string status
        string location
        string remark
        datetime created_at
    }
```

### 4.2 订单状态枚举
- `pending`：待接单
- `accepted`：已接单
- `picked_up`：已接宠
- `in_transit`：运输中
- `arrived`：已到达
- `completed`：已完成
- `cancelled`：已取消

## 5. 项目目录结构
```
src/
├── components/          # 通用组件
│   ├── Layout/          # 布局组件（侧边栏、头部）
│   ├── ui/              # 基础UI组件（按钮、卡片、表单等）
│   └── StatusTimeline/  # 状态时间线组件
├── pages/               # 页面组件
│   ├── Dashboard/
│   ├── Pets/
│   ├── Routes/
│   ├── Pricing/
│   ├── Vehicles/
│   ├── Orders/
│   ├── Dispatch/
│   └── Employees/
├── store/               # Zustand 状态管理
│   ├── petStore.ts
│   ├── orderStore.ts
│   ├── routeStore.ts
│   ├── vehicleStore.ts
│   └── employeeStore.ts
├── types/               # TypeScript 类型定义
├── utils/               # 工具函数（计费计算、格式化等）
├── mock/                # Mock 初始数据
├── assets/              # 静态资源
├── App.tsx
├── main.tsx
└── index.css
```
