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
    }
    
    // 根据角色获取用户
    getUserByRole(role) {
        const user = this.users.find(u => u.role === role);
        if (!user) {
            // 如果没有找到，创建一个临时用户
            return this.createTempUser(role);
        }
        return user;
    }
    
    // 创建临时用户
    createTempUser(role) {
        const roleNames = {
            admin: '系统管理员',
            manager: '部门经理',
            hr: '人事专员',
            finance: '财务人员',
            employee: '普通员工'
        };
        
        const departments = {
            admin: '管理部',
            manager: '管理部',
            hr: '人力资源部',
            finance: '财务部',
            employee: '技术部'
        };
        
        return {
            id: Date.now(),
            username: role,
            name: roleNames[role] || role,
            role: role,
            department: departments[role] || '其他部门'
        };
    }
}