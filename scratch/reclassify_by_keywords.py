import json
from pathlib import Path
from collections import Counter

app_dir = Path(r"d:\BaiduNetdiskDownload\软考中级设计师课程\中级 软件设计师(软设)\ruankao-quiz-app")
json_path = app_dir / "public" / "questions.json"

keywords_map = {
    "上午题 #1 计算机系统题目": [
        "cpu", "运算器", "控制器", "寄存器", "程序计数器", "流水线", "寻址方式", "cisc", "risc", 
        "cache", "高速缓存", "命中率", "主存", "内存", "ram", "rom", "闪存", "flash", "总线", 
        "系统可靠性", "并联系统", "串联系统", "模冗余", "crc", "海明码", "校验码", "纠错", 
        "原码", "反码", "补码", "移码", "定点数", "浮点数", "阶码", "尾数", "规格化", "溢出",
        "定点纯小数", "定点二进制", "数据表示", "寻址"
    ],
    "上午题 #2 程序设计语言题目": [
        "正规式", "正规集", "dfa", "nfa", "自动机", "有限自动机", "文法", "词法分析", "语法分析",
        "语义分析", "中间代码", "后缀式", "逆波兰", "语法树", "函数调用", "传值", "传址", 
        "引用调用", "参数传递", "程序语言", "静态局部变量", "编译", "解释", "程序中定义的"
    ],
    "上午题 #3、4 数据结构 上、下 题目": [
        "链表", "顺序表", "双向链表", "单链表", "队列", "双端队列", "栈", "先进后出", "先进先出",
        "二叉树", "树", "森林", "叶子节点", "叶子结点", "结点的度", "树的度", "前序", "中序", "后序", 
        "遍历", "哈夫曼树", "线索二叉树", "平衡二叉树", "avl", "b树", "b+树", "红黑树", 
        "邻接矩阵", "邻接表", "图", "有向图", "无向图", "深度遍历", "广度遍历", "拓扑排序", 
        "关键路径", "查找表", "二分查找", "折半查找", "散列表", "哈希", "冲突解决", 
        "快速排序", "堆排序", "冒泡排序", "插入排序", "希尔排序", "归并排序", "选择排序", 
        "二叉排序树", "数据结构", "二维数组"
    ],
    "上午题 #5 知识产权题目": [
        "知识产权", "著作权", "版权", "专利", "商标", "商业秘密", "侵权", "职务作品", "发表权", 
        "署名权", "修改权", "保护期", "不正当竞争", "侵犯"
    ],
    "上午题 #6 数据库题目": [
        "关系模式", "关系表", "候选键", "主键", "外键", "范式", "1nf", "2nf", "3nf", "bcnf", 
        "4nf", "规范化", "无损连接", "函数依赖", "多值依赖", "关系代数", "笛卡尔积", "投影", 
        "选择操作", "连接操作", "sql", "select", "grant", "revoke", "基本表", "视图", 
        "外模式", "内模式", "e-r", "实体-联系", "并发控制", "封锁协议"
    ],
    "上午题 #7 面向对象题目": [
        "面向对象", "多态", "封装", "继承", "基类", "派生类", "重载", "析构函数", "构造函数", 
        "动态绑定", "静态绑定", "面向对象软件", "面向对象测试"
    ],
    "上午题 #8 UML题目": [
        "uml", "类图", "用例图", "序列图", "顺序图", "状态图", "活动图", "构件图", "部署图", 
        "对象图", "包图", "协作图", "泛化", "实现", "聚合", "组合", "关联关系"
    ],
    "上午题 #9 设计模式题目": [
        "设计模式", "创建型", "结构型", "行为型", "桥接", "观察者", "observer", "singleton", 
        "单例", "适配器", "adapter", "decorator", "装饰", "proxy", "代理", "factory", 
        "工厂", "facade", "外观", "strategy", "策略", "command", "命令", "state", "状态模式", 
        "flyweight", "享元", "mediator", "中介", "visitor", "访问者", "iterator", "迭代"
    ],
    "上午题 #10 操作系统题目": [
        "pv操作", "信号量", "死锁", "银行家算法", "页式", "段式", "段页式", "逻辑地址", "物理地址", 
        "页面置换", "fifo", "lru", "移臂调度", "sstf", "scan", "文件系统", "位示图", "bitmap", 
        "fat", "空闲块", "索引文件", "磁盘的容量", "存储分配", "前趋图", "进程", "线程", 
        "作业调度", "spooling", "虚存", "虚拟存储", "硬盘所属的存储", "键盘最适合", "cpu 调度"
    ],
    "上午题 #11 结构化开发题目": [
        "数据流图", "dfd", "数据字典", "结构化分析", "结构化设计", "sa", "sd"
    ],
    "上午题 #12、13 软件工程 上、下 题目": [
        "软件开发模型", "瀑布模型", "螺旋模型", "喷泉模型", "增量模型", "原型模型", "v模型", 
        "敏捷", "xp", "scrum", "软件测试", "黑盒测试", "白盒测试", "环路复杂度", "环复杂度", 
        "mccabe", "麦凯布", "等价类", "边界值", "系统维护", "软件维护", "纠错性", "适应性", 
        "完善性", "预防性", "甘特图", "gantt", "pert", "软件文档", "风险管理", "风险"
    ],
    "上午题 #14 信息安全题目": [
        "加密", "解密", "密钥", "公钥", "私钥", "对称加密", "非对称加密", "数字签名", 
        "数字证书", "ca", "des", "aes", "rsa", "rc4", "sha", "md5", "防火墙", "漏洞", 
        "攻击", "木马", "病毒", "入侵检测", "ids", "ips", "机密性", "完整性", "可用性"
    ],
    "上午题 #15 计算机网络题目": [
        "子网", "掩码", "ip地址", "网关", "路由", "交换机", "路由器", "tcp", "udp", "ip协议", 
        "dns", "dhcp", "http", "ftp", "smtp", "ping", "arp", "icmp", "端口号", "osi", 
        "传输层", "网络层", "应用层", "物理层", "链路层", "以太网", "vlan"
    ],
    "上午题 #16 算法题目": [
        "分治", "动态规划", "贪心", "回溯", "分支限界", "渐进符号", "时间复杂度", "空间复杂度", 
        "最长公共子序列", "背包问题", "最少比较次数", "最坏情况下", "哈夫曼编码"
    ]
}

def classify(q):
    # Combine fields to look for keywords
    texts = [q.get("stem", "")]
    for opt in q.get("options", []):
        texts.append(opt.get("text", ""))
    for rh in q.get("rawHtml", []):
        texts.append(rh)
    
    combined = " ".join(texts).lower()
    
    # Calculate scores
    scores = {}
    for subject, kws in keywords_map.items():
        score = 0
        for kw in kws:
            if kw.lower() in combined:
                # Add weight based on keyword length to favor specific matches
                score += len(kw)
        scores[subject] = score
        
    # Get max score
    max_subject = max(scores, key=scores.get)
    if scores[max_subject] > 0:
        return max_subject
    return "综合知识"

def main():
    if not json_path.exists():
        print(f"Database not found at {json_path}")
        return

    with open(json_path, "r", encoding="utf-8") as f:
        db = json.load(f)

    questions = db.get("questions", [])
    report_lines = []
    updated_count = 0

    for q in questions:
        years = q.get("years", [])
        is_new_year = any(y in years for y in ["2022", "2023", "2024"])
        if not is_new_year:
            continue
            
        old_subject = q["sources"][0].get("subject", "")
        new_subject = classify(q)
        
        # If no keywords matched, try to keep old subject if it wasn't a generic one
        if new_subject == "综合知识" and old_subject not in ["综合知识", "None", ""]:
            new_subject = old_subject
            
        # Update in sources
        q["sources"][0]["subject"] = new_subject
        # Also update chapter to match the subject for consistency
        q["sources"][0]["chapter"] = new_subject
        
        report_lines.append(f"Year: {q.get('year')} | Blank: {q.get('blank')} | Old: {old_subject} -> New: {new_subject} | Stem: {q.get('stem')[:50]}")
        updated_count += 1

    # Re-calculate metadata statistics
    by_subject = Counter(q["sources"][0]["subject"] for q in questions if q.get("sources"))
    by_chapter = Counter(q["sources"][0]["chapter"] for q in questions if q.get("sources"))
    by_year = Counter(year for q in questions for year in q.get("years", []))
    
    db["meta"]["subjects"] = by_subject
    db["meta"]["chapters"] = by_chapter
    db["meta"]["years"] = dict(sorted(by_year.items(), reverse=True))

    # Save report
    with open(app_dir / "scratch" / "reclassification_report.txt", "w", encoding="utf-8") as rf:
        rf.write("\n".join(report_lines))

    # Save database
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)

    print(f"Reclassified {updated_count} questions. Report written to scratch/reclassification_report.txt")

if __name__ == "__main__":
    main()
