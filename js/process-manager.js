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

// 用户管理器 
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
    
    // 模拟角色登录（简化版）
    simulateLogin(role) {
        const user = this.users.find(u => u.role === role && u.isActive !== false);
        if (user) {
            this.currentUser = user;
            
            // 更新最后登录时间
            user.lastLogin = new Date().toISOString();
            this.saveToLocalStorage();
            
            this.saveSession();
            return user;
        }
        
        // 如果没有对应角色用户，创建临时用户
        const tempUser = {
            id: Date.now(),
            username: role,
            role: role,
            department: this.getDepartmentByRole(role),
            name: this.getRoleName(role),
            isActive: true,
            isTemp: true
        };
        
        this.currentUser = tempUser;
        this.saveSession();
        return tempUser;
    }
    
    // 获取部门名称
    getDepartmentByRole(role) {
        const departmentMap = {
            admin: "管理部",
            manager: "管理部", 
            hr: "人力资源部",
            finance: "财务部",
            employee: "技术部",
            sales: "销售部",
            tech: "技术部"
        };
        return departmentMap[role] || "其他部门";
    }
    
    // 获取角色中文名
    getRoleName(role) {
        const roleNames = {
            admin: "系统管理员",
            manager: "部门经理",
            employee: "普通员工",
            hr: "人事专员",
            finance: "财务人员",
            sales: "销售人员",
            tech: "技术人员"
        };
        return roleNames[role] || role;
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
                
                // 如果恢复的是临时用户，重新从数据库获取完整信息
                if (!this.currentUser.isTemp) {
                    const fullUser = this.getUserById(this.currentUser.id);
                    if (fullUser) {
                        this.currentUser = fullUser;
                    }
                }
                
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
    
    // 获取所有用户
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
    
    // 根据角色获取用户
    getUserByRole(role) {
        return this.users.find(u => u.role === role && u.isActive !== false);
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
    
    // 启用/禁用用户
    toggleUserStatus(userId, isActive) {
        const user = this.getUserById(userId);
        if (!user) {
            throw new Error('用户不存在');
        }
        
        // 不能禁用当前登录用户
        if (this.currentUser && this.currentUser.id === userId && isActive === false) {
            throw new Error('不能禁用当前登录的用户');
        }
        
        return this.updateUser(userId, { isActive });
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
    
    // 永久删除用户（硬删除）
    permanentDeleteUser(userId) {
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
        
        const index = this.users.findIndex(u => u.id === userId);
        if (index !== -1) {
            const deletedUser = this.users.splice(index, 1)[0];
            this.saveToLocalStorage();
            
            console.log(`用户 ${deletedUser.name} (${deletedUser.username}) 已永久删除`);
            return true;
        }
        
        return false;
    }
    
    // 搜索用户
    searchUsers(keyword) {
        if (!keyword) return this.getAllUsers();
        
        const lowerKeyword = keyword.toLowerCase();
        return this.users.filter(user => 
            user.isActive !== false && (
                (user.username && user.username.toLowerCase().includes(lowerKeyword)) ||
                (user.name && user.name.toLowerCase().includes(lowerKeyword)) ||
                (user.email && user.email.toLowerCase().includes(lowerKeyword)) ||
                (user.department && user.department.toLowerCase().includes(lowerKeyword)) ||
                (user.role && user.role.toLowerCase().includes(lowerKeyword))
            )
        );
    }
    
    // 获取角色统计
    getUserStats() {
        const activeUsers = this.getAllUsers();
        
        return {
            total: activeUsers.length,
            byRole: activeUsers.reduce((stats, user) => {
                stats[user.role] = (stats[user.role] || 0) + 1;
                return stats;
            }, {}),
            byDepartment: activeUsers.reduce((stats, user) => {
                stats[user.department] = (stats[user.department] || 0) + 1;
                return stats;
            }, {})
        };
    }
    
    // ==================== 数据持久化 ====================
    
    // 保存到本地存储
    saveToLocalStorage() {
        try {
            localStorage.setItem('processSystemUsers', JSON.stringify(this.users));
        } catch (error) {
            console.error('保存用户数据失败:', error);
            // 尝试清除旧数据后重试
            try {
                localStorage.removeItem('processSystemUsers');
                localStorage.setItem('processSystemUsers', JSON.stringify(this.users));
            } catch (e) {
                console.error('重试保存也失败:', e);
            }
        }
    }
    
    // 从本地存储加载
    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('processSystemUsers');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                
                // 验证数据格式
                if (Array.isArray(parsedData)) {
                    // 合并本地存储的数据和当前数据
                    const savedIds = new Set(parsedData.map(p => p.id));
                    const newUsers = this.users.filter(u => !savedIds.has(u.id));
                    this.users = [...parsedData, ...newUsers];
                }
            }
        } catch (error) {
            console.error('从本地存储加载用户数据失败:', error);
            // 如果加载失败，使用默认数据
            localStorage.removeItem('processSystemUsers');
            if (this.users.length === 0) {
                this.initializeDefaultUsers();
            }
        }
    }
    
    // 导出用户数据
    exportUsers(format = 'json') {
        const activeUsers = this.getAllUsers();
        
        if (format === 'json') {
            return JSON.stringify(activeUsers, null, 2);
        } else if (format === 'csv') {
            // 简单的CSV生成
            const headers = ['用户名', '姓名', '角色', '部门', '邮箱', '创建时间', '最后登录'];
            const rows = activeUsers.map(user => [
                user.username,
                user.name || '',
                this.getRoleName(user.role),
                user.department || '',
                user.email || '',
                user.createdAt || '',
                user.lastLogin || ''
            ]);
            
            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');
            
            return csvContent;
        }
        
        return '';
    }
    
    // 导入用户数据
    importUsers(data, format = 'json') {
        try {
            let usersToImport = [];
            
            if (format === 'json') {
                usersToImport = JSON.parse(data);
            } else if (format === 'csv') {
                // 简单的CSV解析
                const lines = data.split('\n');
                const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                
                usersToImport = lines.slice(1).map(line => {
                    const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
                    const user = {};
                    headers.forEach((header, index) => {
                        user[header] = values[index] || '';
                    });
                    return user;
                });
            }
            
            // 验证导入数据
            if (!Array.isArray(usersToImport)) {
                throw new Error('导入数据格式不正确');
            }
            
            // 处理导入的用户
            let successCount = 0;
            let errorCount = 0;
            const errors = [];
            
            usersToImport.forEach((userData, index) => {
                try {
                    // 验证必要字段
                    if (!userData.username || !userData.role) {
                        throw new Error('缺少必要字段');
                    }
                    
                    // 检查是否已存在
                    const existingUser = this.getUserByUsername(userData.username);
                    if (existingUser) {
                        // 更新现有用户
                        this.updateUser(existingUser.id, userData);
                    } else {
                        // 添加新用户
                        this.addUser(userData);
                    }
                    
                    successCount++;
                } catch (error) {
                    errorCount++;
                    errors.push(`第${index + 1}行: ${error.message}`);
                }
            });
            
            this.saveToLocalStorage();
            
            return {
                success: true,
                imported: successCount,
                failed: errorCount,
                errors: errors
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // 重置为默认用户
    resetToDefault() {
        if (!confirm('确定要重置所有用户数据吗？这将删除所有自定义用户，恢复为默认用户。')) {
            return false;
        }
        
        this.users = [];
        localStorage.removeItem('processSystemUsers');
        this.initializeDefaultUsers();
        
        // 如果当前用户不是默认用户，注销
        const defaultUser = this.users.find(u => u.username === 'admin');
        if (this.currentUser && this.currentUser.username !== 'admin') {
            this.logout();
        }
        
        return true;
    }
}
