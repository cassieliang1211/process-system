// 流程管理器
class ProcessManager {
    constructor(processes = []) {
        this.processes = processes;
        this.loadFromLocalStorage();
    }
    
    // 设置流程数据
    setProcesses(processes) {
        this.processes = processes;
    }
    
    // 获取所有流程
    getProcesses() {
        return this.processes;
    }
    
    // 根据ID获取流程
    getProcessById(id) {
        return this.processes.find(process => process.id === id);
    }
    
    // 获取用户可见的流程
    getVisibleProcesses(userRole) {
        if (!userRole) return [];
        
        return this.processes.filter(process => {
            return process.visibleTo && process.visibleTo.includes(userRole);
        });
    }
    
    // 搜索流程
    searchProcesses(keyword, processes = null) {
        const searchIn = processes || this.processes;
        const lowerKeyword = keyword.toLowerCase();
        
        return searchIn.filter(process => {
            return (
                (process.title && process.title.toLowerCase().includes(lowerKeyword)) ||
                (process.description && process.description.toLowerCase().includes(lowerKeyword)) ||
                (process.department && process.department.toLowerCase().includes(lowerKeyword)) ||
                (process.owner && process.owner.toLowerCase().includes(lowerKeyword)) ||
                (process.steps && process.steps.some(step => 
                    (step.title && step.title.toLowerCase().includes(lowerKeyword)) ||
                    (step.description && step.description.toLowerCase().includes(lowerKeyword))
                ))
            );
        });
    }
    
    // 按分类筛选
    filterByCategory(processes, category) {
        if (category === 'all') return processes;
        return processes.filter(process => process.category === category);
    }
    
    // 添加新流程
    addProcess(processData) {
        this.processes.unshift(processData);
        this.saveToLocalStorage();
        return processData;
    }
    
    // 更新流程
    updateProcess(id, processData) {
        const index = this.processes.findIndex(p => p.id === id);
        if (index !== -1) {
            this.processes[index] = { ...this.processes[index], ...processData };
            this.saveToLocalStorage();
            return this.processes[index];
        }
        return null;
    }
    
    // 删除流程
    deleteProcess(id) {
        const index = this.processes.findIndex(p => p.id === id);
        if (index !== -1) {
            this.processes.splice(index, 1);
            this.saveToLocalStorage();
            return true;
        }
        return false;
    }
    
    // 保存到本地存储
    saveToLocalStorage() {
        try {
            localStorage.setItem('processSystemData', JSON.stringify(this.processes));
        } catch (error) {
            console.error('保存到本地存储失败:', error);
        }
    }
    
    // 从本地存储加载
    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('processSystemData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                // 合并本地存储的数据和初始数据
                const savedIds = new Set(parsedData.map(p => p.id));
                const newProcesses = this.processes.filter(p => !savedIds.has(p.id));
                this.processes = [...parsedData, ...newProcesses];
            }
        } catch (error) {
            console.error('从本地存储加载失败:', error);
        }
    }
}

// 用户管理器 - 完整版本
class UserManager {
    constructor(users = []) {
        this.users = users;
        this.currentUser = null;
        this.loadFromLocalStorage();
        
        // 如果没有用户，初始化默认用户
        if (this.users.length === 0) {
            this.initializeDefaultUsers();
        }
    }
    
    // 初始化默认用户
    initializeDefaultUsers() {
        const defaultUsers = [
            {
                id: 1,
                username: "admin",
                password: "123456",
                role: "admin",
                department: "管理部",
                name: "系统管理员",
                email: "admin@company.com",
                createdAt: new Date().toISOString().split('T')[0],
                isActive: true,
                lastLogin: null
            },
            {
                id: 2,
                username: "manager",
                password: "123456",
                role: "manager",
                department: "管理部",
                name: "部门经理",
                email: "manager@company.com",
                createdAt: new Date().toISOString().split('T')[0],
                isActive: true,
                lastLogin: null
            },
            {
                id: 3,
                username: "hr",
                password: "123456",
                role: "hr",
                department: "人力资源部",
                name: "人事专员",
                email: "hr@company.com",
                createdAt: new Date().toISOString().split('T')[0],
                isActive: true,
                lastLogin: null
            },
            {
                id: 4,
                username: "finance",
                password: "123456",
                role: "finance",
                department: "财务部",
                name: "财务人员",
                email: "finance@company.com",
                createdAt: new Date().toISOString().split('T')[0],
                isActive: true,
                lastLogin: null
            },
            {
                id: 5,
                username: "employee",
                password: "123456",
                role: "employee",
                department: "技术部",
                name: "普通员工",
                email: "employee@company.com",
                createdAt: new Date().toISOString().split('T')[0],
                isActive: true,
                lastLogin: null
            }
        ];
        
        this.users = defaultUsers;
        this.saveToLocalStorage();
    }
    
    // ==================== 用户认证相关 ====================
    
    // 模拟登录验证
    login(username, password) {
        const user = this.users.find(u => 
            u.username.toLowerCase() === username.toLowerCase() && 
            u.password === password &&
            u.isActive !== false
        );
        
        if (user) {
            this.currentUser = user;
            
            // 更新最后登录时间
            user.lastLogin = new Date().toISOString();
            this.saveToLocalStorage();
            
            this.saveSession();
            return user;
        }
        return null;
    }
    
    // 根据角色获取用户
    getUserByRole(role) {
        return this.users.find(u => u.role === role && u.isActive !== false);
    }
    
    // 保存会话
    saveSession() {
        if (this.currentUser) {
            sessionStorage.setItem('processSystemUser', JSON.stringify(this.currentUser));
        }
    }
    
    // 恢复会话
    restoreSession() {
        const savedUser = sessionStorage.getItem('processSystemUser');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                return this.currentUser;
            } catch (e) {
                console.error('恢复会话失败:', e);
                this.currentUser = null;
            }
        }
        return null;
    }
    
    // 注销
    logout() {
        this.currentUser = null;
        sessionStorage.removeItem('processSystemUser');
    }
    
    // ==================== 用户管理 CRUD ====================
    
    // 获取所有活跃用户
    getAllUsers() {
        return this.users.filter(user => user.isActive !== false);
    }
    
    // 根据ID获取用户
    getUserById(id) {
        return this.users.find(u => u.id === id && u.isActive !== false);
    }
    
    // 根据用户名获取用户
    getUserByUsername(username) {
        return this.users.find(u => 
            u.username.toLowerCase() === username.toLowerCase() && 
            u.isActive !== false
        );
    }
    
    // 添加新用户
    addUser(userData) {
        // 验证用户名是否已存在
        const existingUser = this.getUserByUsername(userData.username);
        if (existingUser) {
            throw new Error('用户名已存在');
        }
        
        // 生成唯一ID
        const newId = Math.max(...this.users.map(u => u.id), 0) + 1;
        
        const newUser = {
            id: newId,
            username: userData.username,
            password: userData.password || '123456', // 默认密码
            role: userData.role,
            department: userData.department,
            name: userData.name || userData.username,
            email: userData.email,
            isActive: true,
            createdAt: new Date().toISOString().split('T')[0],
            createdBy: this.currentUser ? this.currentUser.id : null,
            lastLogin: null
        };
        
        this.users.push(newUser);
        this.saveToLocalStorage();
        
        console.log(`用户 ${newUser.name} (${newUser.username}) 创建成功`);
        return newUser;
    }
    
    // 修改用户信息
    updateUser(userId, userData) {
        const user = this.getUserById(userId);
        if (!user) {
            throw new Error('用户不存在');
        }
        
        // 如果修改用户名，检查是否冲突
        if (userData.username && userData.username !== user.username) {
            const existingUser = this.getUserByUsername(userData.username);
            if (existingUser && existingUser.id !== userId) {
                throw new Error('用户名已存在');
            }
        }
        
        // 更新用户信息
        const updatedUser = {
            ...user,
            ...userData,
            updatedAt: new Date().toISOString().split('T')[0],
            updatedBy: this.currentUser ? this.currentUser.id : null
        };
        
        // 替换原用户
        const index = this.users.findIndex(u => u.id === userId);
        this.users[index] = updatedUser;
        
        this.saveToLocalStorage();
        
        // 如果修改的是当前登录用户，更新currentUser
        if (this.currentUser && this.currentUser.id === userId) {
            this.currentUser = updatedUser;
            this.saveSession();
        }
        
        console.log(`用户 ${updatedUser.name} (${updatedUser.username}) 更新成功`);
        return updatedUser;
    }
    
    // 修改用户密码
    changePassword(userId, newPassword) {
        const user = this.getUserById(userId);
        if (!user) {
            throw new Error('用户不存在');
        }
        
        // 验证新密码长度
        if (newPassword.length < 6) {
            throw new Error('密码至少需要6位字符');
        }
        
        return this.updateUser(userId, { 
            password: newPassword,
            passwordChangedAt: new Date().toISOString().split('T')[0]
        });
    }
    
    // 删除用户（软删除）
    deleteUser(userId) {
        const user = this.getUserById(userId);
        if (!user) {
            throw new Error('用户不存在');
        }
        
        // 不能删除当前登录用户
        if (this.currentUser && this.currentUser.id === userId) {
            throw new Error('不能删除当前登录的用户');
        }
        
        // 不能删除最后一个管理员
        if (user.role === 'admin') {
            const adminCount = this.users.filter(u => u.role === 'admin' && u.isActive !== false).length;
            if (adminCount <= 1) {
                throw new Error('不能删除最后一个管理员账号');
            }
        }
        
        // 软删除：标记为不活跃
        return this.updateUser(userId, { 
            isActive: false,
            deletedAt: new Date().toISOString().split('T')[0],
            deletedBy: this.currentUser ? this.currentUser.id : null
        });
    }
    
    // ==================== 数据持久化 ====================
    
    // 保存到本地存储
    saveToLocalStorage() {
        try {
            localStorage.setItem('processSystemUsers', JSON.stringify(this.users));
        } catch (error) {
            console.error('保存用户数据失败:', error);
        }
    }
    
    // 从本地存储加载
    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('processSystemUsers');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                // 合并本地存储的数据和当前数据
                const savedIds = new Set(parsedData.map(p => p.id));
                const newUsers = this.users.filter(u => !savedIds.has(u.id));
                this.users = [...parsedData, ...newUsers];
            }
        } catch (error) {
            console.error('从本地存储加载用户数据失败:', error);
        }
    }
}
