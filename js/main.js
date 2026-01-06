// 系统主逻辑
class ProcessSystem {
    constructor() {
        this.currentUser = null;
        this.currentCategory = 'all';
        this.currentView = 'grid'; // grid 或 list
        this.searchKeyword = '';
        this.filterRoles = [];
        
        // 初始化
        this.init();
    }
    
    async init() {
        // 检查是否有已保存的用户会话
        this.restoreSession();
        
        // 加载数据
        await this.loadData();
        
        // 初始化UI
        this.initUI();
        
        // 显示合适的页面
        if (this.currentUser) {
            this.showMainPage();
        } else {
            this.showLoginPage();
        }
    }
    
    // 从sessionStorage恢复会话
    restoreSession() {
        const savedUser = sessionStorage.getItem('processSystemUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
            } catch (e) {
                console.error('恢复会话失败:', e);
                this.currentUser = null;
            }
        }
    }
    
    // 保存会话到sessionStorage
    saveSession() {
        if (this.currentUser) {
            sessionStorage.setItem('processSystemUser', JSON.stringify(this.currentUser));
        }
    }
    
    // 加载流程数据
    async loadData() {
        try {
            const response = await fetch('data/processes.json');
            const data = await response.json();
            
            // 初始化ProcessManager
            if (!window.processManager) {
                window.processManager = new ProcessManager(data.processes);
            } else {
                window.processManager.setProcesses(data.processes);
            }
            
            // 初始化UserManager
            if (!window.userManager) {
                window.userManager = new UserManager(data.users || []);
            }
            
            console.log('数据加载成功');
        } catch (error) {
            console.error('加载数据失败:', error);
            // 使用默认数据
            this.initDefaultData();
        }
    }
    
    // 初始化默认数据
    initDefaultData() {
        const defaultProcesses = [
            {
                id: 1,
                title: "新员工入职流程",
                category: "hr",
                subcategory: "招聘入职",
                description: "规范新员工入职流程，确保顺利融入公司",
                department: "人力资源部",
                visibleTo: ["admin", "manager", "hr", "employee"],
                steps: [
                    { number: 1, title: "入职前准备", description: "准备办公设备、账号、门禁卡等" },
                    { number: 2, title: "入职报到", description: "到人力资源部报到，提交相关材料" },
                    { number: 3, title: "入职培训", description: "参加公司规章制度和企业文化培训" },
                    { number: 4, title: "部门报到", description: "到分配部门报到，认识同事和领导" },
                    { number: 5, title: "试用期管理", description: "试用期期间的工作安排和考核" }
                ],
                owner: "人力资源部",
                version: "2.1",
                createdAt: "2024-01-15",
                updatedAt: "2024-03-10"
            },
            {
                id: 2,
                title: "费用报销流程",
                category: "finance",
                subcategory: "日常报销",
                description: "规范员工费用报销流程，确保合规高效",
                department: "财务部",
                visibleTo: ["admin", "manager", "finance", "employee"],
                steps: [
                    { number: 1, title: "填写报销单", description: "在系统中填写报销申请，附上发票和说明" },
                    { number: 2, title: "部门审批", description: "部门经理审批报销申请" },
                    { number: 3, title: "财务审核", description: "财务人员审核票据合规性和金额准确性" },
                    { number: 4, title: "付款处理", description: "财务出纳进行付款处理" },
                    { number: 5, title: "凭证归档", description: "财务人员将相关凭证归档保存" }
                ],
                owner: "财务部",
                version: "3.0",
                createdAt: "2024-01-10",
                updatedAt: "2024-02-28"
            },
            {
                id: 3,
                title: "请假审批流程",
                category: "hr",
                subcategory: "考勤管理",
                description: "员工请假申请和审批流程",
                department: "人力资源部",
                visibleTo: ["admin", "manager", "hr"],
                steps: [
                    { number: 1, title: "提交申请", description: "员工在系统中提交请假申请" },
                    { number: 2, title: "直接上级审批", description: "直接上级审批请假申请" },
                    { number: 3, title: "HR备案", description: "人力资源部备案并更新考勤记录" },
                    { number: 4, title: "请假生效", description: "请假申请生效，员工开始休假" }
                ],
                owner: "人力资源部",
                version: "1.5",
                createdAt: "2024-01-05",
                updatedAt: "2024-02-15"
            },
            {
                id: 4,
                title: "采购审批流程",
                category: "finance",
                subcategory: "采购管理",
                description: "公司采购物品和服务的审批流程",
                department: "财务部",
                visibleTo: ["admin", "manager", "finance"],
                steps: [
                    { number: 1, title: "提交采购申请", description: "填写采购需求申请单" },
                    { number: 2, title: "预算审批", description: "财务部门审核预算" },
                    { number: 3, title: "采购执行", description: "采购部门执行采购" },
                    { number: 4, title: "验收付款", description: "验收合格后办理付款" },
                    { number: 5, title: "入库登记", description: "物品入库登记，更新资产台账" }
                ],
                owner: "采购部",
                version: "2.2",
                createdAt: "2024-01-20",
                updatedAt: "2024-03-05"
            },
            {
                id: 5,
                title: "软件开发流程",
                category: "tech",
                subcategory: "研发管理",
                description: "软件项目从需求到上线的完整流程",
                department: "技术部",
                visibleTo: ["admin", "manager", "tech"],
                steps: [
                    { number: 1, title: "需求分析", description: "与业务部门沟通，明确需求" },
                    { number: 2, title: "技术设计", description: "进行系统架构和技术方案设计" },
                    { number: 3, title: "开发实现", description: "编写代码，实现功能" },
                    { number: 4, title: "测试验收", description: "进行系统测试和用户验收" },
                    { number: 5, title: "上线部署", description: "部署到生产环境，正式上线" }
                ],
                owner: "技术部",
                version: "4.0",
                createdAt: "2024-02-01",
                updatedAt: "2024-03-20"
            },
            {
                id: 6,
                title: "客户投诉处理流程",
                category: "sales",
                subcategory: "客户服务",
                description: "规范客户投诉的接收、处理和反馈流程",
                department: "客户服务部",
                visibleTo: ["admin", "manager", "sales"],
                steps: [
                    { number: 1, title: "投诉接收", description: "客服人员记录客户投诉内容" },
                    { number: 2, title: "问题分析", description: "相关部门分析投诉原因" },
                    { number: 3, title: "制定方案", description: "制定解决方案和处理计划" },
                    { number: 4, title: "执行处理", description: "执行解决方案" },
                    { number: 5, title: "客户反馈", description: "向客户反馈处理结果" },
                    { number: 6, title: "问题归档", description: "将投诉案例归档，用于改进服务" }
                ],
                owner: "客户服务部",
                version: "2.3",
                createdAt: "2024-02-10",
                updatedAt: "2024-03-15"
            }
        ];
        
        if (!window.processManager) {
            window.processManager = new ProcessManager(defaultProcesses);
        }
        
        if (!window.userManager) {
            const defaultUsers = [
                { id: 1, username: "admin", role: "admin", department: "管理部", name: "系统管理员" },
                { id: 2, username: "manager", role: "manager", department: "管理部", name: "部门经理" },
                { id: 3, username: "hr", role: "hr", department: "人力资源部", name: "人事专员" },
                { id: 4, username: "finance", role: "finance", department: "财务部", name: "财务人员" },
                { id: 5, username: "employee", role: "employee", department: "技术部", name: "普通员工" }
            ];
            window.userManager = new UserManager(defaultUsers);
        }
    }
    
    // 初始化UI
    initUI() {
        // 初始化角色选择
        this.initRoleSelection();
        
        // 初始化事件监听
        this.initEventListeners();
    }
    
    // 初始化角色选择
    initRoleSelection() {
        const roleCards = document.querySelectorAll('.role-card');
        roleCards.forEach(card => {
            card.addEventListener('click', () => {
                const role = card.dataset.role;
                this.selectRole(role);
            });
        });
    }
    
    // 选择角色
    selectRole(role) {
        // 更新UI
        document.querySelectorAll('.role-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`.role-card[data-role="${role}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        // 保存选中的角色
        this.selectedRole = role;
    }
    
    // 登录
    login() {
        const password = document.getElementById('password')?.value;
        
        if (!this.selectedRole) {
            alert('请先选择您的角色');
            return;
        }
        
        if (!password && password !== '') {
            alert('请输入密码');
            return;
        }
        
        // 模拟登录验证
        this.currentUser = window.userManager.getUserByRole(this.selectedRole);
        
        if (this.currentUser) {
            this.saveSession();
            this.showMainPage();
        } else {
            alert('登录失败，请稍后重试');
        }
    }
    
    // 显示登录页面
    showLoginPage() {
        document.getElementById('loginPage').classList.add('active');
        document.getElementById('mainPage').classList.remove('active');
    }
    
    // 显示主页面
    showMainPage() {
        document.getElementById('loginPage').classList.remove('active');
        document.getElementById('mainPage').classList.add('active');
        
        // 更新用户信息显示
        this.updateUserInfo();
        
        // 初始化侧边栏菜单
        this.initSidebarMenu();
        
        // 初始化角色过滤
        this.initRoleFilters();
        
        // 加载流程数据
        this.loadProcesses();
    }
    
    // 更新用户信息显示
    updateUserInfo() {
        if (!this.currentUser) return;
        
        const userNameElement = document.getElementById('userName');
        const userRoleElement = document.getElementById('userRole');
        
        if (userNameElement) {
            userNameElement.textContent = this.currentUser.name || this.currentUser.username;
        }
        
        if (userRoleElement) {
            const roleNames = {
                admin: '系统管理员',
                manager: '部门经理',
                hr: '人事专员',
                finance: '财务人员',
                employee: '普通员工'
            };
            userRoleElement.textContent = roleNames[this.currentUser.role] || this.currentUser.role;
        }
        
        // 显示/隐藏管理员功能
        const adminActions = document.getElementById('adminActions');
        if (adminActions) {
            adminActions.style.display = this.currentUser.role === 'admin' ? 'block' : 'none';
        }
        
        const addFirstProcessBtn = document.getElementById('addFirstProcessBtn');
        if (addFirstProcessBtn) {
            addFirstProcessBtn.style.display = this.currentUser.role === 'admin' ? 'inline-flex' : 'none';
        }
    }
    
    // 初始化侧边栏菜单
    initSidebarMenu() {
        const processes = window.processManager.getProcesses();
        const categories = this.groupByCategory(processes);
        
        const categoryMenu = document.getElementById('categoryMenu');
        if (!categoryMenu) return;
        
        categoryMenu.innerHTML = '';
        
        // 添加"全部"选项
        const allItem = this.createCategoryItem('all', '全部流程', processes.length);
        categoryMenu.appendChild(allItem);
        
        // 添加各分类
        for (const [category, items] of Object.entries(categories)) {
            const categoryItem = this.createCategoryItem(
                category, 
                this.getCategoryName(category), 
                items.length,
                this.groupBySubcategory(items)
            );
            categoryMenu.appendChild(categoryItem);
        }
        
        // 添加事件监听
        this.initCategoryEvents();
    }
    
    // 按分类分组
    groupByCategory(processes) {
        return processes.reduce((groups, process) => {
            const category = process.category || 'other';
            if (!groups[category]) {
                groups[category] = [];
            }
            groups[category].push(process);
            return groups;
        }, {});
    }
    
    // 按子分类分组
    groupBySubcategory(processes) {
        return processes.reduce((groups, process) => {
            const subcategory = process.subcategory || 'default';
            if (!groups[subcategory]) {
                groups[subcategory] = [];
            }
            groups[subcategory].push(process);
            return groups;
        }, {});
    }
    
    // 获取分类名称
    getCategoryName(category) {
        const names = {
            hr: '人事行政',
            finance: '财务管理',
            sales: '销售业务',
            tech: '技术研发',
            operation: '运营管理',
            other: '其他'
        };
        return names[category] || category;
    }
    
    // 创建分类菜单项
    createCategoryItem(categoryId, categoryName, count, subcategories = null) {
        const item = document.createElement('div');
        item.className = 'category-item';
        
        let html = `
            <div class="category-header" data-category="${categoryId}">
                <div class="category-title">
                    <i class="fas ${this.getCategoryIcon(categoryId)}"></i>
                    <span>${categoryName}</span>
                </div>
                <div class="category-info">
                    <span class="category-count">${count}</span>
                    ${subcategories ? '<span class="category-toggle"><i class="fas fa-chevron-down"></i></span>' : ''}
                </div>
            </div>
        `;
        
        if (subcategories && Object.keys(subcategories).length > 0) {
            html += `<div class="subcategory-list">`;
            for (const [subId, subItems] of Object.entries(subcategories)) {
                html += `
                    <div class="subcategory-item" data-category="${categoryId}" data-subcategory="${subId}">
                        <span>${subId}</span>
                        <span class="category-count">${subItems.length}</span>
                    </div>
                `;
            }
            html += `</div>`;
        }
        
        item.innerHTML = html;
        return item;
    }
    
    // 获取分类图标
    getCategoryIcon(category) {
        const icons = {
            hr: 'fa-users',
            finance: 'fa-chart-line',
            sales: 'fa-handshake',
            tech: 'fa-code',
            operation: 'fa-cogs',
            other: 'fa-folder'
        };
        return icons[category] || 'fa-folder';
    }
    
    // 初始化分类事件
    initCategoryEvents() {
        // 分类标题点击事件
        document.querySelectorAll('.category-header').forEach(header => {
            header.addEventListener('click', (e) => {
                const category = header.dataset.category;
                this.selectCategory(category);
                
                // 切换子分类显示
                const toggle = header.querySelector('.category-toggle');
                if (toggle) {
                    const sublist = header.nextElementSibling;
                    if (sublist && sublist.classList.contains('subcategory-list')) {
                        sublist.classList.toggle('active');
                        toggle.querySelector('i').classList.toggle('fa-chevron-down');
                        toggle.querySelector('i').classList.toggle('fa-chevron-up');
                    }
                }
                
                e.stopPropagation();
            });
        });
        
        // 子分类点击事件
        document.querySelectorAll('.subcategory-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const category = item.dataset.category;
                const subcategory = item.dataset.subcategory;
                this.selectCategory(category, subcategory);
                e.stopPropagation();
            });
        });
    }
    
    // 选择分类
    selectCategory(category, subcategory = null) {
        this.currentCategory = category;
        this.currentSubcategory = subcategory;
        
        // 更新UI状态
        document.querySelectorAll('.category-header').forEach(header => {
            header.classList.remove('active');
        });
        
        document.querySelectorAll('.subcategory-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 激活选中的分类
        const selectedHeader = document.querySelector(`.category-header[data-category="${category}"]`);
        if (selectedHeader) {
            selectedHeader.classList.add('active');
        }
        
        // 激活选中的子分类
        if (subcategory) {
            const selectedSub = document.querySelector(`.subcategory-item[data-category="${category}"][data-subcategory="${subcategory}"]`);
            if (selectedSub) {
                selectedSub.classList.add('active');
            }
        }
        
        // 更新面包屑
        this.updateBreadcrumb();
        
        // 加载流程
        this.loadProcesses();
    }
    
    // 更新面包屑
    updateBreadcrumb() {
        const breadcrumbElement = document.getElementById('breadcrumb');
        if (!breadcrumbElement) return;
        
        let breadcrumb = '所有业务流程';
        
        if (this.currentCategory !== 'all') {
            breadcrumb = this.getCategoryName(this.currentCategory);
            
            if (this.currentSubcategory) {
                breadcrumb += ` > ${this.currentSubcategory}`;
            }
        }
        
        breadcrumbElement.textContent = breadcrumb;
    }
    
    // 初始化角色过滤
    initRoleFilters() {
        const roleFiltersElement = document.getElementById('roleFilters');
        if (!roleFiltersElement) return;
        
        const roles = [
            { id: 'admin', name: '管理员' },
            { id: 'manager', name: '经理' },
            { id: 'hr', name: '人事' },
            { id: 'finance', name: '财务' },
            { id: 'employee', name: '员工' }
        ];
        
        roleFiltersElement.innerHTML = '';
        
        // 添加"全部"选项
        const allOption = document.createElement('div');
        allOption.className = 'filter-option active';
        allOption.textContent = '全部';
        allOption.addEventListener('click', () => {
            this.filterRoles = [];
            this.updateRoleFilterUI();
            this.loadProcesses();
        });
        roleFiltersElement.appendChild(allOption);
        
        // 添加各角色选项
        roles.forEach(role => {
            const option = document.createElement('div');
            option.className = 'filter-option';
            option.textContent = role.name;
            option.dataset.role = role.id;
            option.addEventListener('click', () => {
                this.toggleRoleFilter(role.id);
            });
            roleFiltersElement.appendChild(option);
        });
    }
    
    // 切换角色过滤
    toggleRoleFilter(role) {
        const index = this.filterRoles.indexOf(role);
        if (index === -1) {
            this.filterRoles.push(role);
        } else {
            this.filterRoles.splice(index, 1);
        }
        
        this.updateRoleFilterUI();
        this.loadProcesses();
    }
    
    // 更新角色过滤UI
    updateRoleFilterUI() {
        document.querySelectorAll('.filter-option').forEach(option => {
            option.classList.remove('active');
        });
        
        // 如果没有选中任何角色，激活"全部"
        if (this.filterRoles.length === 0) {
            const allOption = document.querySelector('.filter-option:first-child');
            if (allOption) {
                allOption.classList.add('active');
            }
        } else {
            // 激活选中的角色
            this.filterRoles.forEach(role => {
                const roleOption = document.querySelector(`.filter-option[data-role="${role}"]`);
                if (roleOption) {
                    roleOption.classList.add('active');
                }
            });
        }
    }
    
    // 加载流程
    loadProcesses() {
        if (!window.processManager) return;
        
        // 显示加载状态
        this.showLoading();
        
        // 获取当前用户可见的流程
        let processes = window.processManager.getVisibleProcesses(this.currentUser.role);
        
        // 按分类过滤
        if (this.currentCategory !== 'all') {
            processes = processes.filter(p => p.category === this.currentCategory);
            
            // 按子分类过滤
            if (this.currentSubcategory) {
                processes = processes.filter(p => p.subcategory === this.currentSubcategory);
            }
        }
        
        // 按角色过滤
        if (this.filterRoles.length > 0) {
            processes = processes.filter(p => {
                return this.filterRoles.some(role => p.visibleTo.includes(role));
            });
        }
        
        // 搜索过滤
        if (this.searchKeyword) {
            processes = window.processManager.searchProcesses(this.searchKeyword, processes);
        }
        
        // 更新统计信息
        this.updateStats(processes.length);
        
        // 渲染流程
        this.renderProcesses(processes);
    }
    
    // 显示加载状态
    showLoading() {
        const container = document.getElementById('processContainer');
        const emptyState = document.getElementById('emptyState');
        
        if (container) {
            container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> 加载中...</div>';
        }
        
        if (emptyState) {
            emptyState.style.display = 'none';
        }
    }
    
    // 更新统计信息
    updateStats(visibleCount) {
        const totalElement = document.getElementById('totalProcesses');
        const visibleElement = document.getElementById('visibleProcesses');
        
        if (totalElement && window.processManager) {
            const total = window.processManager.getProcesses().length;
            totalElement.textContent = total;
        }
        
        if (visibleElement) {
            visibleElement.textContent = visibleCount;
        }
    }
    
    // 渲染流程
    renderProcesses(processes) {
        const container = document.getElementById('processContainer');
        const emptyState = document.getElementById('emptyState');
        
        if (!container) return;
        
        if (processes.length === 0) {
            container.innerHTML = '';
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            return;
        }
        
        if (emptyState) {
            emptyState.style.display = 'none';
        }
        
        // 根据视图模式渲染
        if (this.currentView === 'grid') {
            this.renderGrid(processes, container);
        } else {
            this.renderList(processes, container);
        }
        
        // 添加流程卡片点击事件
        this.initProcessCardEvents();
    }
    
    // 渲染网格视图
    renderGrid(processes, container) {
        let html = '';
        
        processes.forEach(process => {
            const roleTags = process.visibleTo.map(role => {
                const roleNames = {
                    admin: '管理员',
                    manager: '经理',
                    hr: '人事',
                    finance: '财务',
                    employee: '员工',
                    tech: '技术'
                };
                return `<span class="role-tag">${roleNames[role] || role}</span>`;
            }).join('');
            
            // 获取前3个步骤
            const stepsPreview = process.steps.slice(0, 3).map(step => `
                <div class="process-step-item">
                    <span class="step-number">${step.number}</span>
                    <span class="step-title">${step.title}</span>
                </div>
            `).join('');
            
            html += `
                <div class="process-card" data-id="${process.id}">
                    <div class="process-header">
                        <div class="process-title">
                            <span>${process.title}</span>
                            <span class="process-category">${this.getCategoryName(process.category)}</span>
                        </div>
                    </div>
                    <div class="process-body">
                        <div class="process-description">${process.description}</div>
                        <div class="process-steps-preview">
                            ${stepsPreview}
                            ${process.steps.length > 3 ? '<div class="step-more">...还有' + (process.steps.length - 3) + '个步骤</div>' : ''}
                        </div>
                    </div>
                    <div class="process-footer">
                        <div class="process-meta">
                            <div class="meta-item">
                                <i class="fas fa-building"></i>
                                <span>${process.department}</span>
                            </div>
                            <div class="meta-item">
                                <i class="fas fa-user-check"></i>
                                <span>${process.owner}</span>
                            </div>
                        </div>
                        <div class="process-roles">
                            ${roleTags}
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    // 渲染列表视图
    renderList(processes, container) {
        let html = '<div class="process-list-view">';
        
        processes.forEach(process => {
            html += `
                <div class="process-list-item" data-id="${process.id}">
                    <div class="list-item-main">
                        <h4>${process.title}</h4>
                        <p class="list-item-desc">${process.description}</p>
                        <div class="list-item-meta">
                            <span><i class="fas fa-folder"></i> ${this.getCategoryName(process.category)}</span>
                            <span><i class="fas fa-building"></i> ${process.department}</span>
                            <span><i class="fas fa-user-check"></i> ${process.owner}</span>
                            <span><i class="fas fa-list-ol"></i> ${process.steps.length}个步骤</span>
                        </div>
                    </div>
                    <div class="list-item-actions">
                        <button class="btn-view" onclick="viewProcessDetail(${process.id})">
                            <i class="fas fa-eye"></i> 查看
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
    }
    
    // 初始化流程卡片事件
    initProcessCardEvents() {
        document.querySelectorAll('.process-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.btn-view')) {
                    const processId = card.dataset.id;
                    this.viewProcessDetail(processId);
                }
            });
        });
    }
    
    // 查看流程详情
    viewProcessDetail(processId) {
        const process = window.processManager.getProcessById(parseInt(processId));
        if (!process) return;
        
        // 更新模态框内容
        document.getElementById('detailTitle').textContent = process.title;
        
        // 更新元数据
        const metaHtml = `
            <div class="meta-item">
                <strong>分类:</strong> ${this.getCategoryName(process.category)}
            </div>
            <div class="meta-item">
                <strong>部门:</strong> ${process.department}
            </div>
            <div class="meta-item">
                <strong>负责人:</strong> ${process.owner}
            </div>
            <div class="meta-item">
                <strong>版本:</strong> ${process.version}
            </div>
            <div class="meta-item">
                <strong>更新日期:</strong> ${process.updatedAt || process.createdAt}
            </div>
            <div class="meta-item">
                <strong>可见角色:</strong> ${process.visibleTo.map(role => {
                    const roleNames = {
                        admin: '管理员',
                        manager: '经理',
                        hr: '人事',
                        finance: '财务',
                        employee: '员工',
                        tech: '技术'
                    };
                    return roleNames[role] || role;
                }).join(', ')}
            </div>
        `;
        
        document.getElementById('processMeta').innerHTML = metaHtml;
        
        // 更新描述
        document.getElementById('processDescriptionDetail').innerHTML = `
            <h3><i class="fas fa-align-left"></i> 流程描述</h3>
            <p>${process.description}</p>
        `;
        
        // 更新步骤
        const stepsHtml = process.steps.map(step => `
            <div class="step-detail-item">
                <div class="step-detail-header">
                    <div class="step-detail-number">${step.number}</div>
                    <div class="step-detail-title">${step.title}</div>
                </div>
                <div class="step-detail-content">
                    ${step.description}
                </div>
            </div>
        `).join('');
        
        document.getElementById('processStepsDetail').innerHTML = `
            <h3><i class="fas fa-list-ol"></i> 流程步骤 (${process.steps.length})</h3>
            ${stepsHtml}
        `;
        
        // 显示模态框
        this.showModal('processDetailModal');
    }
    
    // 搜索流程
    searchProcesses() {
        const searchInput = document.getElementById('globalSearch');
        if (!searchInput) return;
        
        this.searchKeyword = searchInput.value.trim();
        
        // 显示/隐藏搜索结果
        const resultsContainer = document.getElementById('searchResults');
        if (resultsContainer) {
            if (this.searchKeyword) {
                const results = window.processManager.searchProcesses(this.searchKeyword);
                this.displaySearchResults(results, resultsContainer);
                resultsContainer.classList.add('active');
            } else {
                resultsContainer.classList.remove('active');
                resultsContainer.innerHTML = '';
            }
        }
        
        // 重新加载流程
        this.loadProcesses();
    }
    
    // 显示搜索结果
    displaySearchResults(results, container) {
        if (results.length === 0) {
            container.innerHTML = '<div class="search-result-item">没有找到相关流程</div>';
            return;
        }
        
        let html = '';
        results.slice(0, 10).forEach(process => {
            html += `
                <div class="search-result-item" onclick="viewProcessDetail(${process.id})">
                    <h4>${process.title}</h4>
                    <p>${process.department} · ${this.getCategoryName(process.category)}</p>
                </div>
            `;
        });
        
        if (results.length > 10) {
            html += `<div class="search-result-item" style="text-align: center; color: #667eea;">
                还有${results.length - 10}个结果，请查看完整列表
            </div>`;
        }
        
        container.innerHTML = html;
    }
    
    // 切换视图模式
    toggleViewMode() {
        this.currentView = this.currentView === 'grid' ? 'list' : 'grid';
        
        const toggleButton = document.getElementById('viewToggle');
        if (toggleButton) {
            const icon = toggleButton.querySelector('i');
            const text = toggleButton.querySelector('span') || toggleButton;
            
            if (this.currentView === 'grid') {
                icon.className = 'fas fa-th-large';
                text.textContent = '网格视图';
            } else {
                icon.className = 'fas fa-th-list';
                text.textContent = '列表视图';
            }
        }
        
        this.loadProcesses();
    }
    
    // 刷新数据
    refreshData() {
        this.loadData().then(() => {
            this.loadProcesses();
            this.initSidebarMenu();
        });
    }
    
    // 显示添加流程模态框
    showAddProcessModal() {
        // 重置表单
        document.getElementById('addProcessForm').reset();
        
        // 重置步骤编辑器
        const stepsContainer = document.getElementById('stepsContainer');
        stepsContainer.innerHTML = `
            <div class="step-item">
                <div class="step-header">
                    <span class="step-number">1</span>
                    <input type="text" class="step-title" placeholder="步骤标题" required>
                    <button type="button" class="btn-step-remove" onclick="removeStep(this)">&times;</button>
                </div>
                <textarea class="step-details" placeholder="步骤详细说明..." required></textarea>
            </div>
        `;
        
        // 显示模态框
        this.showModal('addProcessModal');
    }
    
    // 添加步骤
    addStep() {
        const stepsContainer = document.getElementById('stepsContainer');
        const stepCount = stepsContainer.children.length + 1;
        
        const stepHtml = `
            <div class="step-item">
                <div class="step-header">
                    <span class="step-number">${stepCount}</span>
                    <input type="text" class="step-title" placeholder="步骤标题" required>
                    <button type="button" class="btn-step-remove" onclick="removeStep(this)">&times;</button>
                </div>
                <textarea class="step-details" placeholder="步骤详细说明..." required></textarea>
            </div>
        `;
        
        stepsContainer.insertAdjacentHTML('beforeend', stepHtml);
    }
    
    // 移除步骤
    removeStep(button) {
        const stepItem = button.closest('.step-item');
        if (stepItem && stepsContainer.children.length > 1) {
            stepItem.remove();
            this.renumberSteps();
        }
    }
    
    // 重新编号步骤
    renumberSteps() {
        const steps = document.querySelectorAll('.step-item');
        steps.forEach((step, index) => {
            const numberElement = step.querySelector('.step-number');
            if (numberElement) {
                numberElement.textContent = index + 1;
            }
        });
    }
    
    // 添加新流程
    addNewProcess(event) {
        event.preventDefault();
        
        // 收集表单数据
        const title = document.getElementById('processTitle').value;
        const category = document.getElementById('processCategory').value;
        const department = document.getElementById('processDepartment').value;
        const description = document.getElementById('processDescription').value;
        const owner = document.getElementById('processOwner').value;
        const version = document.getElementById('processVersion').value;
        
        // 收集可见角色
        const roleCheckboxes = document.querySelectorAll('input[name="roles"]:checked');
        const visibleTo = Array.from(roleCheckboxes).map(cb => cb.value);
        
        // 收集步骤
        const stepItems = document.querySelectorAll('.step-item');
        const steps = Array.from(stepItems).map((item, index) => {
            const title = item.querySelector('.step-title').value;
            const description = item.querySelector('.step-details').value;
            return {
                number: index + 1,
                title: title,
                description: description
            };
        });
        
        // 创建新流程对象
        const newProcess = {
            id: Date.now(),
            title: title,
            category: category,
            department: department,
            description: description,
            visibleTo: visibleTo,
            steps: steps,
            owner: owner,
            version: version,
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        };
        
        // 添加到流程管理器
        window.processManager.addProcess(newProcess);
        
        // 关闭模态框
        this.closeModal('addProcessModal');
        
        // 重新加载流程
        this.loadProcesses();
        
        // 重新初始化侧边栏菜单
        this.initSidebarMenu();
        
        // 显示成功消息
        alert('流程添加成功！');
        
        return false;
    }
    
    // 导出流程数据
    exportProcesses() {
        const processes = window.processManager.getProcesses();
        const dataStr = JSON.stringify(processes, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `业务流程数据_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
    
    // 显示模态框
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }
    
    // 关闭模态框
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }
    
    // 切换侧边栏
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
        }
    }
    
    // 折叠所有分类
    collapseAllCategories() {
        document.querySelectorAll('.subcategory-list').forEach(list => {
            list.classList.remove('active');
        });
        
        document.querySelectorAll('.category-toggle i').forEach(icon => {
            icon.className = 'fas fa-chevron-down';
        });
    }
    
    // 初始化事件监听
    initEventListeners() {
        // 搜索输入事件
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.addEventListener('input', () => this.searchProcesses());
            
            // 点击页面其他区域隐藏搜索结果
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.search-container')) {
                    const results = document.getElementById('searchResults');
                    if (results) {
                        results.classList.remove('active');
                    }
                }
            });
        }
        
        // 模态框关闭事件
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }
    
    // 登出
    logout() {
        this.currentUser = null;
        sessionStorage.removeItem('processSystemUser');
        this.showLoginPage();
    }
}

// 创建全局实例
let processSystem;

// 页面加载完成后初始化系统
document.addEventListener('DOMContentLoaded', () => {
    processSystem = new ProcessSystem();
});

// 全局函数供HTML调用
function selectRole(role) {
    processSystem.selectRole(role);
}

function login() {
    processSystem.login();
}

function logout() {
    processSystem.logout();
}

function toggleSidebar() {
    processSystem.toggleSidebar();
}

function collapseAllCategories() {
    processSystem.collapseAllCategories();
}

function searchProcesses() {
    processSystem.searchProcesses();
}

function toggleViewMode() {
    processSystem.toggleViewMode();
}

function refreshData() {
    processSystem.refreshData();
}

function showAddProcessModal() {
    processSystem.showAddProcessModal();
}

function closeModal(modalId) {
    processSystem.closeModal(modalId);
}

function addStep() {
    processSystem.addStep();
}

function removeStep(button) {
    processSystem.removeStep(button);
}

function viewProcessDetail(processId) {
    processSystem.viewProcessDetail(processId);
}

function exportProcesses() {
    processSystem.exportProcesses();

}

// 账号管理功能
class UserManagement {
    constructor() {
        this.currentEditingUser = null;
    }
    
    // 显示账号管理界面
    showUserManagement() {
        if (processSystem.currentUser.role !== 'admin') {
            alert('只有管理员可以访问账号管理功能');
            return;
        }
        
        this.loadUserList();
        processSystem.showModal('userManagementModal');
    }
    
    // 加载用户列表
    loadUserList() {
        const userListElement = document.getElementById('userList');
        if (!userListElement) return;
        
        const users = window.userManager.users;
        let html = '';
        
        if (users.length === 0) {
            html = '<tr><td colspan="6" style="text-align: center; padding: 20px;">暂无用户数据</td></tr>';
        } else {
            users.forEach(user => {
                // 跳过当前登录的管理员自己
                if (user.id === processSystem.currentUser.id) return;
                
                const roleName = processSystem.getRoleName(user.role);
                html += `
                    <tr data-user-id="${user.id}">
                        <td>${user.username}</td>
                        <td><span class="role-badge">${roleName}</span></td>
                        <td>${user.department || '-'}</td>
                        <td>${user.name || '-'}</td>
                        <td>${user.createdAt || '未知'}</td>
                        <td class="user-actions">
                            <button class="btn-action-small" onclick="userManagement.changePassword(${user.id})">
                                <i class="fas fa-key"></i> 改密
                            </button>
                            <button class="btn-action-small btn-danger" onclick="userManagement.deleteUser(${user.id})">
                                <i class="fas fa-trash"></i> 删除
                            </button>
                        </td>
                    </tr>
                `;
            });
        }
        
        userListElement.innerHTML = html;
    }
    
    // 显示添加用户表单
    showAddUserForm() {
        document.getElementById('addUserForm').style.display = 'block';
        document.getElementById('addUserFormElement').reset();
        
        // 滚动到表单位置
        document.getElementById('addUserForm').scrollIntoView({ behavior: 'smooth' });
    }
    
    // 隐藏添加用户表单
    hideAddUserForm() {
        document.getElementById('addUserForm').style.display = 'none';
    }
    
    // 添加新用户
    addNewUser(event) {
        event.preventDefault();
        
        const username = document.getElementById('newUsername').value.trim();
        const role = document.getElementById('newUserRole').value;
        const department = document.getElementById('newUserDepartment').value;
        const name = document.getElementById('newUserName').value.trim();
        const password = document.getElementById('newUserPassword').value;
        const email = document.getElementById('newUserEmail').value.trim();
        
        // 验证用户名是否已存在
        const existingUser = window.userManager.users.find(u => u.username === username);
        if (existingUser) {
            alert('用户名已存在，请使用其他用户名');
            return false;
        }
        
        // 创建新用户
        const newUser = {
            id: Date.now(),
            username: username,
            password: password,
            role: role,
            department: department,
            name: name,
            email: email || undefined,
            createdAt: new Date().toISOString().split('T')[0],
            isActive: true
        };
        
        // 添加到用户管理器
        window.userManager.addUser(newUser);
        
        // 重新加载用户列表
        this.loadUserList();
        
        // 隐藏表单
        this.hideAddUserForm();
        
        // 显示成功消息
        alert(`用户 ${name} (${username}) 创建成功！\n初始密码：${password}`);
        
        return false;
    }
    
    // 修改密码
    changePassword(userId) {
        this.currentEditingUser = window.userManager.getUserById(userId);
        if (!this.currentEditingUser) {
            alert('用户不存在');
            return;
        }
        
        // 如果是修改当前登录用户的密码，需要验证当前密码
        if (userId === processSystem.currentUser.id) {
            document.getElementById('currentPassword').style.display = 'block';
            document.querySelector('label[for="currentPassword"]').style.display = 'block';
        } else {
            document.getElementById('currentPassword').style.display = 'none';
            document.querySelector('label[for="currentPassword"]').style.display = 'none';
        }
        
        document.getElementById('targetUserId').value = userId;
        document.getElementById('changePasswordForm').style.display = 'block';
        document.getElementById('changePasswordFormElement').reset();
        
        // 滚动到表单位置
        document.getElementById('changePasswordForm').scrollIntoView({ behavior: 'smooth' });
    }
    
    // 隐藏修改密码表单
    hideChangePasswordForm() {
        document.getElementById('changePasswordForm').style.display = 'none';
        this.currentEditingUser = null;
    }
    
    // 执行密码修改
    changeUserPassword(event) {
        event.preventDefault();
        
        const userId = parseInt(document.getElementById('targetUserId').value);
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // 验证新密码
        if (newPassword.length < 6) {
            alert('新密码至少需要6位字符');
            return false;
        }
        
        if (newPassword !== confirmPassword) {
            alert('两次输入的新密码不一致');
            return false;
        }
        
        // 如果是修改当前用户的密码，需要验证当前密码
        if (userId === processSystem.currentUser.id) {
            const currentUser = window.userManager.currentUser;
            if (currentPassword !== currentUser.password) {
                alert('当前密码错误');
                return false;
            }
        }
        
        // 执行密码修改
        const success = window.userManager.changePassword(userId, newPassword);
        
        if (success) {
            alert('密码修改成功！');
            this.hideChangePasswordForm();
            this.loadUserList();
        } else {
            alert('密码修改失败，请稍后重试');
        }
        
        return false;
    }
    
    // 删除用户
    deleteUser(userId) {
        const user = window.userManager.getUserById(userId);
        if (!user) return;
        
        // 不能删除当前登录用户
        if (userId === processSystem.currentUser.id) {
            alert('不能删除当前登录的用户');
            return;
        }
        
        document.getElementById('userToDeleteId').value = userId;
        document.getElementById('deleteConfirmText').textContent = 
            `确定要删除用户 "${user.name} (${user.username})" 吗？此操作不可恢复。`;
        
        processSystem.showModal('confirmDeleteModal');
    }
    
    // 确认删除用户
    confirmDeleteUser() {
        const userId = parseInt(document.getElementById('userToDeleteId').value);
        
        const success = window.userManager.deleteUser(userId);
        if (success) {
            alert('用户删除成功');
            this.loadUserList();
        } else {
            alert('用户删除失败');
        }
        
        processSystem.closeModal('confirmDeleteModal');
    }
    
    // 导出用户列表
    exportUsers() {
        const users = window.userManager.users;
        const dataStr = JSON.stringify(users, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `用户账号数据_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
}

// 创建全局实例
const userManagement = new UserManagement();

// 全局函数供HTML调用
function showUserManagement() {
    userManagement.showUserManagement();
}

function showAddUserForm() {
    userManagement.showAddUserForm();
}

function hideAddUserForm() {
    userManagement.hideAddUserForm();
}

function addNewUser(event) {
    return userManagement.addNewUser(event);
}

function changeUserPassword(event) {
    return userManagement.changeUserPassword(event);
}

function hideChangePasswordForm() {
    userManagement.hideChangePasswordForm();
}

function confirmDeleteUser() {
    userManagement.confirmDeleteUser();
}
