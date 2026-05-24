import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import Bookmark from "lucide-react/dist/esm/icons/bookmark";
import BookmarkCheck from "lucide-react/dist/esm/icons/bookmark-check";
import CalendarDays from "lucide-react/dist/esm/icons/calendar-days";
import Check from "lucide-react/dist/esm/icons/check";
import ChevronLeft from "lucide-react/dist/esm/icons/chevron-left";
import ChevronRight from "lucide-react/dist/esm/icons/chevron-right";
import Eye from "lucide-react/dist/esm/icons/eye";
import EyeOff from "lucide-react/dist/esm/icons/eye-off";
import ListFilter from "lucide-react/dist/esm/icons/list-filter";
import RotateCcw from "lucide-react/dist/esm/icons/rotate-ccw";
import Search from "lucide-react/dist/esm/icons/search";
import Shuffle from "lucide-react/dist/esm/icons/shuffle";
import X from "lucide-react/dist/esm/icons/x";
import Play from "lucide-react/dist/esm/icons/play";
import CheckCircle from "lucide-react/dist/esm/icons/check-circle";
import AlertCircle from "lucide-react/dist/esm/icons/alert-circle";
import Clock from "lucide-react/dist/esm/icons/clock";
import Award from "lucide-react/dist/esm/icons/award";
import BookOpen from "lucide-react/dist/esm/icons/book-open";
import Calendar from "lucide-react/dist/esm/icons/calendar";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import FileText from "lucide-react/dist/esm/icons/file-text";
import "./styles.css";

const STORAGE_KEY = "ruankao-quiz-state-v1";

// 备战计划配置数据
const STUDY_PLAN_DATA = {
  startDate: "2026-05-24",
  weeks: [
    {
      weekNum: 1,
      title: "第1章 计算机系统知识",
      desc: "主攻原反补移码、流水线、Cache与系统可靠性",
      chapter: "第 #1 章 计算机系统题目",
      days: [
        { day: "周日", task: "环境启动，熟悉本地题库系统" },
        { day: "周一", task: "看《计组 01》+ 刷题20道（原反补移码及浮点数）", practice: true },
        { day: "周二", task: "看《计组 01》+ 刷题20道（CPU寄存器与寻址）", practice: true },
        { day: "周三", task: "看《计组 02》+ 刷题20道（流水线计算）", practice: true },
        { day: "周四", task: "看《计组 03》+ 刷题20道（主存和Cache）", practice: true },
        { day: "周五", task: "看《计组 04》+ 刷题20道（系统可靠性、CRC、海明码）", practice: true },
        { day: "周六", task: "阅读讲义 PDF，并重做第一周全部错题" }
      ]
    },
    {
      weekNum: 2,
      title: "第2章 程序设计语言基础知识",
      desc: "主攻文法分析、正规式与DFA、传值传址",
      chapter: "第 #2 章 程序语言题目",
      days: [
        { day: "周日", task: "在 App 随机刷 20 道计组错题" },
        { day: "周一", task: "看《程序语言 01》+ 刷题20道（编译解释与文法）", practice: true },
        { day: "周二", task: "看《程序语言 01》+ 刷题20道（正规式与DFA自动机）", practice: true },
        { day: "周三", task: "看《程序语言 02》+ 刷题20道（后缀表达式与语法树）", practice: true },
        { day: "周四", task: "看《程序语言 02》+ 刷题20道（传值与传址调用）", practice: true },
        { day: "周五", task: "通读本章讲义，理解各种主流语言的编译机制" },
        { day: "周六", task: "重做本周全部错题，清空错题库" }
      ]
    },
    {
      weekNum: 3,
      title: "第3章 数据结构（上）",
      desc: "线性结构与二叉树遍历、哈夫曼编码",
      chapter: "第 #3、4 章 数据结构与算法题目",
      days: [
        { day: "周日", task: "在 App 中挑选前两章的错题进行“错题回炉”" },
        { day: "周一", task: "看《数据结构 01》+ 刷题20道（单链表操作及矩阵压缩公式）", practice: true },
        { day: "周二", task: "看《数据结构 02》+ 刷题20道（二叉树前中后序遍历）", practice: true },
        { day: "周三", task: "看《数据结构 02》+ 刷题20道（哈夫曼树构造与平衡二叉树）", practice: true },
        { day: "周四", task: "精读讲义，手写矩阵压缩公式和哈夫曼编码规则" },
        { day: "周五", task: "刷 30 道二叉树相关的上午选择题", practice: true },
        { day: "周六", task: "在纸上默写前中序推后序、后中序推前序的过程" }
      ]
    },
    {
      weekNum: 4,
      title: "第3章 数据结构（下）",
      desc: "图算法、最小生成树、查找与排序复杂度",
      chapter: "第 #3、4 章 数据结构与算法题目",
      days: [
        { day: "周日", task: "二叉树错题重练" },
        { day: "周一", task: "看《数据结构 03》+ 刷题20道（邻接矩阵、图的遍历）", practice: true },
        { day: "周二", task: "主攻图算法 + 刷题20道（最小生成树、最短路径计算）", practice: true },
        { day: "周三", task: "看《数据结构 04》+ 刷题20道（哈希表冲突、B/B+树基础）", practice: true },
        { day: "周四", task: "看《数据结构 05》+ 刷题20道（各种排序的时间/空间复杂度）", practice: true },
        { day: "周五", task: "通读本章讲义，默写常见排序算法复杂度对比表格" },
        { day: "周六", task: "在 App 集中练习图和排序相关的 40 道选择题", practice: true }
      ]
    },
    {
      weekNum: 5,
      title: "第4章 操作系统",
      desc: "PV操作、银行家算法、页式存储与物理地址计算",
      chapter: "第 #10 章 操作系统题目",
      days: [
        { day: "周日", task: "默背排序算法复杂度表" },
        { day: "周一", task: "看《操作系统 01》+ 专项猛刷 20 道 PV 操作选择题", practice: true },
        { day: "周二", task: "看《操作系统 02》+ 刷题20道（前趋图与银行家算法）", practice: true },
        { day: "周三", task: "看《操作系统 03》+ 刷题20道（页式地址转换、物理地址计算）", practice: true },
        { day: "周四", task: "看《操作系统 03》+ 刷题20道（磁盘移臂调度、文件索引计算）", practice: true },
        { day: "周五", task: "精读操作系统讲义" },
        { day: "周六", task: "清理操作系统错题" }
      ]
    },
    {
      weekNum: 6,
      title: "第5、6章 软件工程与结构化开发",
      desc: "白盒测试路径、甘特图与PERT关键路径",
      chapter: "第 #15 章 软件工程题目",
      days: [
        { day: "周日", task: "手做 3 道 PV 操作下午大题" },
        { day: "周一", task: "看《软件工程 01》+ 刷题20道（开发模型对比）", practice: true },
        { day: "周二", task: "看《软件工程 02》+ 刷题20道（甘特图、PERT关键路径）", practice: true },
        { day: "周三", task: "看《软件工程 03》+ 刷题20道（白盒测试路径、环复杂度）", practice: true },
        { day: "周四", task: "看《第6章 结构化开发方法》+ 刷题20道（数据流图概念）", practice: true },
        { day: "周五", task: "阅读软件工程讲义，牢记甘特图和 PERT 关键路径" },
        { day: "周六", task: "验收考核 1：随机抽取 80 道上午题。目标：至少 38 分" }
      ]
    },
    {
      weekNum: 7,
      title: "第7章 面向对象技术——UML",
      desc: "UML各种图概念、下午题结构化与面向对象分析",
      chapter: "第 #8 章 UML题目",
      days: [
        { day: "周日", task: "分析前 6 周错题本，开始做第 1 道下午数据流图 (DFD) 真题" },
        { day: "周一", task: "看《面向对象 01》+ 刷题20道（类图、对象图、用例图）", practice: true },
        { day: "周二", task: "看《面向对象 02》+ 刷题20道（顺序图、状态图、活动图）", practice: true },
        { day: "周三", task: "看《面向对象 03》+ 刷题20道（构件图、部署图）", practice: true },
        { day: "周四", task: "做 1 道 UML 下午大题真题" },
        { day: "周五", task: "主攻下午题 DFD 与 UML 类图的对比和联系" },
        { day: "周六", task: "做 1 道 DFD 真题，1 道 UML 真题" }
      ]
    },
    {
      weekNum: 8,
      title: "第7章 面向对象技术——设计模式",
      desc: "23种设计模式分类与结构、下午C++大题语法",
      chapter: "第 #9 章 设计模式题目",
      days: [
        { day: "周日", task: "复习 UML 关系（泛化、实现、关联、聚合、组合、依赖）" },
        { day: "周一", task: "看《设计模式 01》+ 刷题20道（创建型模式：单例、工厂、建造者）", practice: true },
        { day: "周二", task: "看《设计模式 02》+ 刷题20道（结构型模式：装饰、代理、适配器）", practice: true },
        { day: "周三", task: "看《设计模式 03》+ 刷题20道（行为型模式：观察者、策略、状态）", practice: true },
        { day: "周四", task: "主攻下午 C++ 设计模式真题，手写填空" },
        { day: "周五", task: "阅读设计模式讲义，理解常见模式的代码结构" },
        { day: "周六", task: "手做 2 道下午 C++ 设计模式大题" }
      ]
    },
    {
      weekNum: 9,
      title: "第8章 数据库系统",
      desc: "三级模式、E-R模型、关系代数与规范化、E-R图填空",
      chapter: "第 #6 章 数据库题目",
      days: [
        { day: "周日", task: "手写 23 种设计模式特征及适用场景" },
        { day: "周一", task: "看《数据库 01》+ 刷题20道（三级模式、E-R模型转换）", practice: true },
        { day: "周二", task: "看《数据库 02》+ 刷题20道（关系代数、SQL语句分析）", practice: true },
        { day: "周三", task: "看《数据库 03》+ 刷题20道（规范化理论、求候选键与范式判定）", practice: true },
        { day: "周四", task: "看《数据库 04》并做 1 道下午数据库设计大题" },
        { day: "周五", task: "阅读数据库讲义，重点攻克规范化理论" },
        { day: "周六", task: "手做 2 道下午数据库 E-R 图及关系模式设计大题" }
      ]
    },
    {
      weekNum: 10,
      title: "第9章 网络与信息安全",
      desc: "OSI七层模型、IP子网划分、加密算法与数字签名",
      chapter: "第 #12、13 章 网络与多媒体题目",
      days: [
        { day: "周日", task: "整理并重做数据库和设计模式的错题" },
        { day: "周一", task: "看《网络与安全 01》+ 刷题20道（OSI模型、TCP/IP协议簇）", practice: true },
        { day: "周二", task: "主攻子网划分 + 刷题20道（子网掩码、可用主机IP计算）", practice: true },
        { day: "周三", task: "看《网络与安全 02》+ 刷题20道（对称与非对称加密、数字证书）", practice: true },
        { day: "周四", task: "看《网络与安全 03》+ 刷题20道（常见网络攻击与防火墙）", practice: true },
        { day: "周五", task: "阅读网络与安全讲义，牢记常见端口与协议对应关系" },
        { day: "周六", task: "🚨 验收考试 2：随机抽取 80 道上午题。目标：至少 42 分" }
      ]
    },
    {
      weekNum: 11,
      title: "第10章 知识产权与标准化",
      desc: "侵权判定（著作权、专利权、商标权归属）",
      chapter: "第 #5 章 知识产权与标准化题目",
      days: [
        { day: "周日", task: "针对网络 and 编译原理薄弱点进行专项补课" },
        { day: "周一", task: "看《知识产权 01》+ 刷题20道（著作权归属、职务作品判定）", practice: true },
        { day: "周二", task: "看《知识产权 02》+ 刷题20道（专利权、商标权保护期限与判定）", practice: true },
        { day: "周三", task: "做 1 道下午算法大题（分治与动态规划基础）" },
        { day: "周四", task: "做 1 道下午算法大题（回溯与贪心基础）" },
        { day: "周五", task: "阅读知识产权讲义，牢记各种权力的期限" },
        { day: "周六", task: "在 App 中挑出前 10 周所有错题进行“错题回炉”" }
      ]
    },
    {
      weekNum: 12,
      title: "第11、12章 多媒体与法律法规",
      desc: "多媒体计算、法律法规细节归纳",
      chapter: "第 #12、13 章 网络与多媒体题目",
      days: [
        { day: "周日", task: "算法大题专项错题重做" },
        { day: "周一", task: "看《多媒体 01》+ 刷题20道（音频、图像、视频数据量计算）", practice: true },
        { day: "周二", task: "看《多媒体 02》+ 刷题20道（多媒体常见压缩标准）", practice: true },
        { day: "周三", task: "手做 1 道下午 DFD 真题，1 道下午数据库真题" },
        { day: "周四", task: "手做 1 道下午 UML 真题，1 道下午 C++ 设计模式真题" },
        { day: "周五", task: "通读多媒体与法律法规讲义" },
        { day: "周六", task: "下午大题 4 科联考，闭卷自测时间与手写填空" }
      ]
    },
    {
      weekNum: 13,
      title: "真题模底与单科强化",
      desc: "首套真题自测、查漏补缺",
      chapter: "all",
      days: [
        { day: "周日", task: "整理并重做第 11-12 周的错题" },
        { day: "周一", task: "🚨 模底测试：做 2020.11 真题上午选择题（目标 45 分）", practice: true },
        { day: "周二", task: "🚨 模底测试：做 2020.11 真题下午案例题（目标 40 分）" },
        { day: "周三", task: "对 2020.11 真题进行深度纠错与试卷拆解分析" },
        { day: "周四", task: "针对上午错题集中章节进行专项刷题（如系统分析或软件工程）", practice: true },
        { day: "周五", task: "针对下午扣分最多的科目（如数据结构或算法）进行专项补课" },
        { day: "周六", task: "完成 1 道数据库大题和 1 道算法大题的限时默写" }
      ]
    },
    {
      weekNum: 14,
      title: "真题实战周（二）",
      desc: "2021.11 真题演练与下午大题巩固",
      chapter: "all",
      days: [
        { day: "周日", task: "复习上午的错题本，重刷部分标记题目" },
        { day: "周一", task: "做 2021.11 真题上午选择题（限时 100 分钟）", practice: true },
        { day: "周二", task: "做 2021.11 真题下午案例题（限时 120 分钟）" },
        { day: "周三", task: "2021.11 真题全面纠错与错题录入" },
        { day: "周四", task: "下午 DFD 与 数据库 历年真题对比归纳" },
        { day: "周五", task: "下午 UML 与 C++ 历年真题代码填空对比归纳" },
        { day: "周六", task: "完成 2 道算法设计大题（主攻动态规划）" }
      ]
    },
    {
      weekNum: 15,
      title: "真题实战周（三）",
      desc: "2022.05 真题演练与算法细节打磨",
      chapter: "all",
      days: [
        { day: "周日", task: "将所有错题集重新做一遍" },
        { day: "周一", task: "做 2022.05 真题上午选择题", practice: true },
        { day: "周二", task: "做 2022.05 真题下午案例题" },
        { day: "周三", task: "2022.05 真题解析，总结高频考点" },
        { day: "周四", task: "专项练习上午题：编译原理与操作系统难点" },
        { day: "周五", task: "专项练习下午题：背包问题及分支限界算法模板" },
        { day: "周六", task: "模考分析与单科薄弱环节查漏补缺" }
      ]
    },
    {
      weekNum: 16,
      title: "真题实战周（四）",
      desc: "2022.11 真题全真模拟与分段目标核实",
      chapter: "all",
      days: [
        { day: "周日", task: "上午题高频核心考点默写（计组、软件工程、编译）" },
        { day: "周一", task: "🚨 阶段验收：2022.11 真题上午模拟（目标 50 分）", practice: true },
        { day: "周二", task: "🚨 阶段验收：2022.11 真题下午模拟（目标 45 分）" },
        { day: "周三", task: "2022.11 卷面全错题深入拆解分析" },
        { day: "周四", task: "下午题限时提速训练：DFD画图规则与数据库实体关联" },
        { day: "周五", task: "下午题限时提速训练：C++设计模式经典代码结构默写" },
        { day: "周六", task: "错题精细回炉，再次测试前几周标记错题" }
      ]
    },
    {
      weekNum: 17,
      title: "全真模拟考与提速专项",
      desc: "2023.05 真题全流程封闭自测",
      chapter: "all",
      days: [
        { day: "周日", task: "整理阶段错题，确保无遗留盲点" },
        { day: "周一", task: "闭卷做 2023.05 真题上午选择题", practice: true },
        { day: "周二", task: "闭卷做 2023.05 真题下午案例题" },
        { day: "周三", task: "2023.05 试卷全盘纠错与精细总结" },
        { day: "周四", task: "下午大题“限时模板化”训练（第一场：DFD 与 数据库）" },
        { day: "周五", task: "下午大题“限时模板化”训练（第二场：UML 与 C++）" },
        { day: "周六", task: "错题集本周新增项二次消化" }
      ]
    },
    {
      weekNum: 18,
      title: "全真模拟考与下午题限时冲刺",
      desc: "2023.11 / 2024.05 核心真题演练",
      chapter: "all",
      days: [
        { day: "周日", task: "下午算法大题高频类型模板整理与对比（动态规划、分治、回溯）" },
        { day: "周一", task: "🚨 阶段验收：2023.11 真题上午自测", practice: true },
        { day: "周二", task: "🚨 阶段验收：2023.11 真题下午自测" },
        { day: "周三", task: "2023.11 错题整理与归纳" },
        { day: "周四", task: "做 2024.05 真题上午选择题", practice: true },
        { day: "周五", task: "做 2024.05 真题下午案例题" },
        { day: "周六", task: "🚨 阶段验收结果盘点，分析双科稳定 48 分目标达成度" }
      ]
    },
    {
      weekNum: 19,
      title: "考前冲刺周（一）",
      desc: "高分冲刺、模拟卷演练、大题模板提速",
      chapter: "all",
      days: [
        { day: "周日", task: "全真闭卷模拟测试 1 场（全真模拟卷）" },
        { day: "周一", task: "重温前 18 周整理的下午算法模板，熟记填空规律" },
        { day: "周二", task: "重温下午 C++ 设计模式核心代码，手写经典类定义" },
        { day: "周三", task: "重做真题中考查过的全部 DFD 与 E-R 图错误点" },
        { day: "周四", task: "上午选择题法律法规、标准化专项重温", practice: true },
        { day: "周五", task: "上午选择题多媒体数据量计算公式重背", practice: true },
        { day: "周六", task: "错题集第三轮大清理" }
      ]
    },
    {
      weekNum: 20,
      title: "考前冲刺周（二）",
      desc: "极速复盘、最后考点扫描",
      chapter: "all",
      days: [
        { day: "周日", task: "全真闭卷模拟测试第二场（真题复考）" },
        { day: "周提", task: "极速翻阅 1-12 章讲义 PDF，扫描冷僻概念" },
        { day: "周二", task: "手背 23 种设计模式及 UML 对应表示法" },
        { day: "周三", task: "整理 PV操作、文法DFA、甘特图PERT关键计算公式" },
        { day: "周四", task: "错题集第四轮终极清理，确保做过的题不二错", practice: true },
        { day: "周五", task: "整理近年安全变动情况，调整心态" },
        { day: "周六", task: "全真模拟考试 80 题最终局，目标 >= 52 分" }
      ]
    },
    {
      weekNum: 21,
      title: "考前突击与轻量复习",
      desc: "考前一周、调整心态与轻量温习",
      chapter: "all",
      days: [
        { day: "周日", task: "全真闭卷模拟测试最终场" },
        { day: "周一", task: "复习全部错题集中的标星重点题目" },
        { day: "周二", task: "快速过一遍全部设计模式和UML填空代码结构" },
        { day: "周三", task: "背记海明码、可靠性、规范化等上午核心计算公式" },
        { day: "周四", task: "全身心放松，检查准考证、身份证及文具" },
        { day: "周五", task: "踩点考场，熟悉考点环境与出行路线" },
        { day: "周六", task: "🎯 10.24 上战场！全力冲刺通关中级软件设计师！" }
      ]
    }
  ],
  milestones: [
    {
      id: "m1",
      date: "7月04日 (第6周周末)",
      name: "第 6 周末阶段性验收",
      format: "随机 80 道选择题 (计算机系统、程序语言、数据结构、操作系统、软件工程)",
      target: "上午题 >= 38 分",
      threshold: 38,
      chapters: [
        "第 #1 章 计算机系统题目",
        "第 #10 章 计算机系统题目",
        "第 #2 章 程序语言题目",
        "第 #11 章 编译原理题目",
        "第 #3、4 章 数据结构与算法题目",
        "第 #10 章 操作系统题目",
        "第 #15 章 软件工程题目"
      ]
    },
    {
      id: "m2",
      date: "8月01日 (第10周周末)",
      name: "第 10 周末核心知识验收",
      format: "随机 80 道选择题 (包含网络、安全、UML、设计模式与数据库)",
      target: "上午题 >= 42 分",
      threshold: 42,
      chapters: [
        "第 #1 章 计算机系统题目",
        "第 #10 章 计算机系统题目",
        "第 #2 章 程序语言题目",
        "第 #11 章 编译原理题目",
        "第 #3、4 章 数据结构与算法题目",
        "第 #10 章 操作系统题目",
        "第 #15 章 软件工程题目",
        "第 #8 章 UML题目",
        "第 #7 章 面向对象与设计模式题目",
        "第 #9 章 设计模式题目",
        "第 #6 章 数据库题目",
        "第 #12、13 章 网络与多媒体题目",
        "第 #14 章 信息安全题目"
      ]
    },
    {
      id: "m3",
      date: "9月01日 (第15周初)",
      name: "首套完整真题模底 (2020.11)",
      format: "全随机 80 道真题模底",
      target: "上午题 >= 45 分",
      threshold: 45,
      chapters: ["all"]
    },
    {
      id: "m4",
      date: "10月01日 (第19周初)",
      name: "2022.11 真题模拟",
      format: "全随机 80 道真题模拟",
      target: "上午题 >= 50 分",
      threshold: 50,
      chapters: ["all"]
    },
    {
      id: "m5",
      date: "10月17日 (第21周末)",
      name: "2023.11 真题模拟",
      format: "全随机 80 道下午与下午选择题模拟",
      target: "上午题 >= 48 分",
      threshold: 48,
      chapters: ["all"]
    }
  ]
};

// 缓存状态还原辅助函数
function loadStore() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

// 缓存状态保存辅助函数
function saveStore(value) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

// 答案正则规整函数
function normalizeAnswer(answer) {
  return [...new Set(String(answer || "").toUpperCase().match(/[ABCD]/g) || [])].sort().join("");
}

// 数组随机洗牌函数
function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * 格式化章节/学科名称为美观的展示名称
 * 
 * @param {string} name 数据库原始学科名称
 * @returns {string} 美观的展示名称
 */
function formatSubjectName(name) {
  if (!name) {
    return "未分类";
  }
  const mapping = {
    "上午题 #1 计算机系统题目": "第 1 章：计算机硬件基础",
    "上午题 #2 程序设计语言题目": "第 2 章：程序设计语言",
    "上午题 #3、4 数据结构 上、下 题目": "第 3、4 章：数据结构",
    "上午题 #5 知识产权题目": "第 5 章：知识产权与标准化",
    "上午题 #6 数据库题目": "第 6 章：数据库系统",
    "上午题 #7 面向对象题目": "第 7 章：面向对象技术",
    "上午题 #8 UML题目": "第 8 章：UML 建模",
    "上午题 #9 设计模式题目": "第 9 章：设计模式",
    "上午题 #10 操作系统题目": "第 10 章：操作系统",
    "上午题 #11 结构化开发题目": "第 11 章：结构化开发方法",
    "上午题 #12、13 软件工程 上、下 题目": "第 12、13 章：软件工程",
    "上午题 #14 信息安全题目": "第 14 章：信息安全知识",
    "上午题 #15 计算机网络题目": "第 15 章：计算机网络",
    "上午题 #16 算法题目": "第 16 章：算法设计与分析",
    "综合知识": "综合套卷"
  };
  return mapping[name.trim()] || name;
}

/**
 * 将学习计划的静态章节名称映射为数据库实际学科名称
 * 
 * @param {string} configName 计划配置中的章节名称
 * @returns {string} 数据库中对应的学科名称
 */
function mapConfigToSubject(configName) {
  if (!configName) {
    return "all";
  }
  const mapping = {
    "第 #1 章 计算机系统题目": "上午题 #1 计算机系统题目",
    "第 #10 章 计算机系统题目": "上午题 #10 操作系统题目",
    "第 #2 章 程序语言题目": "上午题 #2 程序设计语言题目",
    "第 #3、4 章 数据结构与算法题目": "上午题 #3、4 数据结构 上、下 题目",
    "第 #5 章 知识产权与标准化题目": "上午题 #5 知识产权题目",
    "第 #6 章 数据库题目": "上午题 #6 数据库题目",
    "第 #7 章 面向对象与设计模式题目": "上午题 #7 面向对象题目",
    "第 #8 章 UML题目": "上午题 #8 UML题目",
    "第 #9 章 设计模式题目": "上午题 #9 设计模式题目",
    "第 #10 章 操作系统题目": "上午题 #10 操作系统题目",
    "第 #11 章 编译原理题目": "上午题 #2 程序设计语言题目",
    "第 #15 章 软件工程题目": "上午题 #12、13 软件工程 上、下 题目",
    "第 #12、13 章 网络与多媒体题目": "上午题 #15 计算机网络题目",
    "第 #14 章 信息安全题目": "上午题 #14 信息安全题目",
    "all": "all"
  };
  return mapping[configName.trim()] || configName;
}

// 每日打卡统计组件
function DailyTrackerCard({ store }) {
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const count = useMemo(() => {
    return Object.values(store.progress || {}).filter((p) => {
      return p.updatedAt >= todayStart;
    }).length;
  }, [store.progress, todayStart]);
  const pct = Math.min(100, (count / 20) * 100);
  return (
    <div className="card">
      <div className="cardHeader">
        <h2><BookOpen size={20} />每日任务打卡</h2>
        {count >= 20 ? (
          <span className="milestoneBadge pass"><CheckCircle size={14} />今日已达标</span>
        ) : (
          <span className="milestoneBadge pending"><AlertCircle size={14} />今日未达标</span>
        )}
      </div>
      <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
        每天理论复习后，建议通过题库练习 <strong>至少 20 道</strong> 选择题巩固知识点。
      </p>
      <div className="progressWrapper">
        <div className="progressBarBg">
          <div className="progressBarFill" style={{ width: `${pct}%` }} />
        </div>
        <span className="progressText">{count} / 20 道</span>
      </div>
    </div>
  );
}

// 周学习进度日程组件
function WeeklyTimelineCard({ currentWeek, setCurrentWeek, setSubject, setYear, setQuery, setMode, setView }) {
  const week = STUDY_PLAN_DATA.weeks[currentWeek];
  
  // 日程点击自动跳链刷题
  function handleJump(chapterName) {
    const mappedName = mapConfigToSubject(chapterName);
    if (mappedName === "all") {
      setSubject("all");
    } else {
      setSubject(mappedName);
    }
    // 重置年份与关键字筛选
    setYear("all");
    setQuery("");
    setMode("all");
    setView("quiz");
  }

  return (
    <div className="card">
      <div className="cardHeader">
        <h2><Calendar size={20} />备考日程安排</h2>
        <div className="weekNavigator">
          <button
            className="navBtn"
            disabled={currentWeek <= 0}
            onClick={() => { setCurrentWeek(currentWeek - 1); }}
          >
            <ChevronLeft size={16} />
          </button>
          <span>第 {currentWeek + 1} / 21 周</span>
          <button
            className="navBtn"
            disabled={currentWeek >= STUDY_PLAN_DATA.weeks.length - 1}
            onClick={() => { setCurrentWeek(currentWeek + 1); }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="weekHeader">
        <h3>{week.title}</h3>
      </div>
      <p className="weekDesc">{week.desc}</p>
      <div className="dayList">
        {week.days.map((d, idx) => {
          return (
            <div key={idx} className="dayRow">
              <span className="dayLabel">{d.day}</span>
              <span className="dayTask">{d.task}</span>
              {d.practice && (
                <button
                  className="dayActionBtn"
                  onClick={() => { handleJump(week.chapter); }}
                >
                  <Play size={12} />刷题
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 刚性及格线模考考核表
function MilestonesTable({ store, setMockExam, questions }) {
  
  // 触发生成 80 道题的模考卷
  function startMock(m) {
    let pool = questions;
    if (m.chapters[0] !== "all") {
      const mappedChapters = m.chapters.map(mapConfigToSubject);
      pool = questions.filter((q) => {
        const sub = q.sources?.[0]?.subject || "";
        return mappedChapters.includes(sub);
      });
    }
    if (pool.length < 10) {
      pool = questions;
    }
    const shuffled = shuffle(pool).slice(0, 80);
    setMockExam({
      id: m.id,
      name: m.name,
      threshold: m.threshold,
      questions: shuffled,
      answers: new Array(shuffled.length).fill(""),
      timeRemaining: 150 * 60,
    });
  }

  return (
    <div className="card">
      <div className="cardHeader">
        <h2><Award size={20} />刚性分数验收线</h2>
      </div>
      <table className="milestonesTable">
        <thead>
          <tr>
            <th>验收时间节点</th>
            <th>及格目标</th>
            <th>当前得分</th>
            <th>验收状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {STUDY_PLAN_DATA.milestones.map((m) => {
            const res = store.mockResults?.[m.id];
            return (
              <tr key={m.id}>
                <td><strong>{m.date}</strong></td>
                <td>{m.target}</td>
                <td>{res ? `${res.score.toFixed(1)}分` : "--"}</td>
                <td>
                  {res ? (
                    res.passed ? (
                      <span className="milestoneBadge pass"><CheckCircle size={12} />已达标</span>
                    ) : (
                      <span className="milestoneBadge fail"><AlertCircle size={12} />未达标</span>
                    )
                  ) : (
                    <span className="milestoneBadge pending">未考核</span>
                  )}
                </td>
                <td>
                  <button className="startMockBtn" onClick={() => { startMock(m); }}>
                    <Play size={12} />开始模考
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// 备战计划仪表盘主视图
function PlanDashboard({ store, setStore, questions, setSubject, setYear, setQuery, setMode, setView, setMockExam }) {
  const [currentWeek, setCurrentWeek] = useState(() => {
    const start = new Date(STUDY_PLAN_DATA.startDate).getTime();
    const now = Date.now();
    const diffWeeks = Math.floor((now - start) / (7 * 24 * 3600 * 1000));
    return Math.max(0, Math.min(STUDY_PLAN_DATA.weeks.length - 1, diffWeeks));
  });

  return (
    <div className="planGrid">
      <DailyTrackerCard store={store} />
      <WeeklyTimelineCard
        currentWeek={currentWeek}
        setCurrentWeek={setCurrentWeek}
        setSubject={setSubject}
        setYear={setYear}
        setQuery={setQuery}
        setMode={setMode}
        setView={setView}
      />
      <MilestonesTable
        store={store}
        setMockExam={setMockExam}
        questions={questions}
      />
    </div>
  );
}

// 模考状态答题卡小组件
function MockAnswerSheet({ questions, answers, currentIdx, setCurrentIdx }) {
  return (
    <div className="card answerSheetCard">
      <div className="cardHeader">
        <h2>答题卡进度</h2>
      </div>
      <div className="answerSheetGrid">
        {questions.map((_, idx) => {
          const className = [
            "sheetCircle",
            idx === currentIdx ? "active" : "",
            answers[idx] ? "answered" : "",
          ].filter(Boolean).join(" ");
          return (
            <button key={idx} className={className} onClick={() => { setCurrentIdx(idx); }}>
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 原文大图灯箱放大缩放组件
 * 
 * @author du
 * @param {object} props 组件属性
 * @returns {JSX.Element} 灯箱展示组件
 */
function ImageLightbox({ imgName, pageLabel, onClose }) {
  const [scale, setScale] = useState(1);
  
  // 处理单击图片循环放大
  function handleImgClick(e) {
    e.stopPropagation();
    setScale((prev) => {
      if (prev === 1) {
        return 1.5;
      }
      if (prev === 1.5) {
        return 2;
      }
      return 1;
    });
  }

  // 处理缩小按钮
  function handleZoomOut() {
    setScale((prev) => {
      return Math.max(1, prev - 0.25);
    });
  }

  // 处理放大按钮
  function handleZoomIn() {
    setScale((prev) => {
      return Math.min(3, prev + 0.25);
    });
  }

  // 阻止工具栏点击穿透
  function preventPropagation(e) {
    e.stopPropagation();
  }

  const imgStyle = scale === 1 ? {
    maxHeight: "85vh",
    maxWidth: "90vw",
    objectFit: "contain",
    cursor: "zoom-out"
  } : {
    width: `${900 * scale}px`,
    maxWidth: "none",
    maxHeight: "none",
    cursor: "grab"
  };

  return (
    <div className="imageLightboxOverlay" onClick={onClose}>
      <div className="lightboxImageContainer">
        <img
          src={`/docx_images/${imgName}`}
          alt="Zoomed Original Page"
          className="lightboxImage"
          style={imgStyle}
          onClick={handleImgClick}
        />
      </div>
      <div className="lightboxToolbar" onClick={preventPropagation}>
        <button onClick={handleZoomOut}>缩小 (-)</button>
        <span>倍率: {scale.toFixed(2)}x</span>
        <button onClick={handleZoomIn}>放大 (+)</button>
        <button onClick={() => { setScale(1); }}>重置</button>
        <span>{pageLabel}</span>
        <button onClick={onClose} style={{ color: "#ff6b6b" }}>关闭</button>
      </div>
    </div>
  );
}

/**
 * 获取当前题目的原卷 PDF 链接
 * 
 * @param {object} current 当前题目对象
 * @returns {string|null} PDF 文件的相对路径
 */
function getQuestionPdfUrl(current) {
  if (!current) {
    return null;
  }
  const year = current.year;
  if (year === "2024") {
    return "/pdf_files/2024-05.pdf";
  }
  if (year === "2023") {
    const hasNov = current.sources?.some((s) => {
      return s.file && (s.file.includes("11月") || s.file.includes("下半年"));
    });
    if (hasNov) {
      return "/pdf_files/2023-11.pdf";
    }
    return "/pdf_files/2023-05.pdf";
  }
  if (year === "2022") {
    return "/pdf_files/2022-11.pdf";
  }
  if (year === "2021") {
    const hasMay = current.sources?.some((s) => {
      return s.file && (s.file.includes("5月") || s.file.includes("05月") || s.file.includes("上半年"));
    });
    if (hasMay) {
      return "/pdf_files/2021-05.pdf";
    }
    return "/pdf_files/2021-11.pdf";
  }
  if (year === "2020") {
    return "/pdf_files/2020-11.pdf";
  }
  return null;
}

// Word 原文及截图比对展示组件
function RawHtmlPanel({ current, compareTab, setCompareTab }) {
  const pageImages = current.page_images || [];
  const pages = current.pages || [];
  const totalPages = current.total_pages || 1;
  const rawHtml = current.rawHtml || [];
  const [zoomImage, setZoomImage] = useState(null);
  const [zoomPageLabel, setZoomPageLabel] = useState("");
  const pdfUrl = getQuestionPdfUrl(current);

  return (
    <div className="rawHtmlPanel">
      <div className="rawHtmlHeader">
        <h3>
          <Eye size={18} />
          Word 原文对比
          {pdfUrl && (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="pdfBadge"
              title="查看/下载当前年份整套真题原卷PDF"
            >
              <FileText size={12} />
              原题 PDF
            </a>
          )}
        </h3>
        <div className="compareTabs">
          <button
            className={compareTab === "image" ? "active" : ""}
            onClick={() => { setCompareTab("image"); }}
          >
            原文截图
          </button>
          <button
            className={compareTab === "text" ? "active" : ""}
            onClick={() => { setCompareTab("text"); }}
          >
            高亮文本
          </button>
        </div>
      </div>

      <div className="rawHtmlContent">
        {compareTab === "image" ? (
          pageImages.length > 0 ? (
            <div className="rawHtmlImages">
              {pageImages.map((imgName, idx) => {
                const pageLabel = `第 ${pages[idx] || idx + 1} 页 / 共 ${totalPages} 页`;
                return (
                  <div key={idx} className="rawImageWrapper">
                    <img
                      src={`/docx_images/${imgName}`}
                      alt={`Word Page ${pages[idx] || idx + 1}`}
                      className="docxPageImage"
                      loading="lazy"
                      onClick={() => {
                        setZoomImage(imgName);
                        setZoomPageLabel(pageLabel);
                      }}
                    />
                    <p className="imageCaption">
                      {pageLabel}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "var(--muted)" }}>
              正在生成该题目的 Word 原文截图，请稍候并重新加载页面...
            </p>
          )
        ) : (
          rawHtml.length > 0 ? (
            rawHtml.map((paraHtml, idx) => {
              return <p key={idx} dangerouslySetInnerHTML={{ __html: paraHtml }} />;
            })
          ) : (
            <p style={{ color: "var(--muted)" }}>此题目未备份 Word 原文 HTML 格式。</p>
          )
        )}
      </div>

      {zoomImage && (
        <ImageLightbox
          imgName={zoomImage}
          pageLabel={zoomPageLabel}
          onClose={() => { setZoomImage(null); }}
        />
      )}
    </div>
  );
}


// 模考顶部计时与名称展示组件
function MockExamHeader({ mockExam, timeLeft }) {
  const formattedTime = useMemo(() => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }, [timeLeft]);

  return (
    <div className="mockHeader">
      <span className="mockTitle">{mockExam.name}</span>
      <span className="mockTimer"><Clock size={18} />{formattedTime}</span>
    </div>
  );
}

// 简单的 Markdown 解析渲染为 HTML 的组件
function MarkdownRenderer({ content }) {
  if (!content) {
    return null;
  }
  let html = content
    .replace(/### (.*?)\n/g, "<h3>$1</h3>")
    .replace(/## (.*?)\n/g, "<h2>$1</h2>")
    .replace(/# (.*?)\n/g, "<h1>$1</h1>");
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/^- (.*?)(?=\n|$)/gm, "<li>$1</li>");
  html = html.split("\n").map((line) => {
    if (line.trim().startsWith("<h") || line.trim().startsWith("<li")) {
      return line;
    }
    return `<p>${line}</p>`;
  }).join("");
  return <div className="markdownBody" dangerouslySetInnerHTML={{ __html: html }} />;
}

// AI 加载状态组件
function AiLoadingStatus() {
  return (
    <div className="aiStatus">
      <div className="spinner" />
      <p>AI 正在分析题目，请稍候...</p>
    </div>
  );
}

// AI 错误状态及重试组件
function AiErrorStatus({ error, onRetry }) {
  return (
    <div className="aiStatus error">
      <AlertCircle size={24} />
      <p>{error}</p>
      <button onClick={onRetry} className="retryBtn">重试</button>
    </div>
  );
}

// 渲染结构化 AI 解析内容的 Tabbed 组件
function AiTabbedContent({ data, correctAnswer }) {
  const [activeTab, setActiveTab] = useState("concept");
  const optionsList = Object.entries(data.options || {});

  return (
    <div className="aiTabbedContainer">
      <div className="aiTabs">
        <button
          className={activeTab === "concept" ? "active" : ""}
          onClick={() => {
            setActiveTab("concept");
          }}
        >
          考点原理
        </button>
        <button
          className={activeTab === "options" ? "active" : ""}
          onClick={() => {
            setActiveTab("options");
          }}
        >
          选项快析
        </button>
        <button
          className={activeTab === "avoid" ? "active" : ""}
          onClick={() => {
            setActiveTab("avoid");
          }}
        >
          避坑口诀
        </button>
      </div>
      <div className="aiTabPanel">
        {activeTab === "concept" && (
          <div className="aiTabSlide">
            <div className="conceptCard point">
              <h4>🎯 考点定位</h4>
              <p>{data.point}</p>
            </div>
            <div className="conceptCard principle">
              <h4>📖 核心原理</h4>
              <p>{data.principle}</p>
            </div>
          </div>
        )}
        {activeTab === "options" && (
          <div className="aiTabSlide">
            {optionsList.map(([key, desc]) => {
              const isCorrect = correctAnswer.includes(key);
              return (
                <div key={key} className={`optionCard ${isCorrect ? "correct" : "wrong"}`}>
                  <span className="optionKey">{key}</span>
                  <div className="optionDesc">
                    <strong>{isCorrect ? "✅ 正确" : "❌ 错误"}</strong>
                    <p>{desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {activeTab === "avoid" && (
          <div className="aiTabSlide">
            <div className="avoidCard">
              <div className="avoidIcon">💡</div>
              <div className="avoidText">
                <h4>避坑指南与速记口诀</h4>
                <p>{data.avoid}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// AI 对话问答区域组件
/**
 * AI 对话问答区域组件
 * 
 * @param {object} props 组件属性
 * @returns {JSX.Element} 对话区域渲染
 */
function AiChatSection({
  messages,
  chatInput,
  setChatInput,
  chatLoading,
  handleSendChat,
  chatEndRef
}) {
  return (
    <div className="aiChatSection">
      <div className="aiChatHeader">
        <span>💬 考点实时答疑</span>
      </div>
      <div className="aiChatMessages">
        <div className="chatBubble assistant first">
          对这道题的考点定位、选项快析或者避坑口诀有什么不懂的吗？可以随时问我哦！
        </div>
        {messages.map((msg, i) => {
          return (
            <div key={i} className={`chatBubble ${msg.role}`}>
              {msg.content}
            </div>
          );
        })}
        {chatLoading && (
          <div className="chatBubble assistant loading">
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <form className="aiChatForm" onSubmit={handleSendChat}>
        <input
          type="text"
          value={chatInput}
          onChange={(e) => {
            setChatInput(e.target.value);
          }}
          placeholder="向 AI 提问这道题..."
          disabled={chatLoading}
        />
        <button type="submit" disabled={chatLoading || !chatInput.trim()}>
          提问
        </button>
      </form>
    </div>
  );
}

// AI 解读控制面板组件
function AiAnalysisPanel({ current, show, onClose }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [cache, setCache] = useState({});
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = React.useRef(null);

  useEffect(() => {
    setMessages([]);
    setChatInput("");
  }, [current]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatLoading]);

  useEffect(() => {
    if (!show || !current) {
      return;
    }
    if (cache[current.id]) {
      setResult(cache[current.id]);
      setError("");
      return;
    }
    fetchAnalysis();
  }, [show, current]);

  /**
   * 提交发送用户追问消息
   * 
   * @param {Event} e 表单提交事件
   */
  async function handleSendChat(e) {
    e.preventDefault();
    const query = chatInput.trim();
    if (!query || chatLoading) {
      return;
    }
    setChatInput("");
    const newMsg = { role: "user", content: query };
    setMessages((prev) => {
      return [...prev, newMsg];
    });
    setChatLoading(true);
    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: current,
          explanation: result,
          history: messages,
          message: query
        })
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setMessages((prev) => {
        return [...prev, { role: "assistant", content: data.message }];
      });
    } catch (err) {
      setMessages((prev) => {
        return [...prev, { role: "assistant", content: `❌ 发送失败: ${err.message}` }];
      });
    } finally {
      setChatLoading(false);
    }
  }

  async function fetchAnalysis() {
    setLoading(true);
    setError("");
    setResult("");
    try {
      const res = await fetch("/api/ai-explain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question: current
        })
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      const text = data.explanation || "未获取到解析内容。";
      setResult(text);
      setCache((prev) => {
        return { ...prev, [current.id]: text };
      });
    } catch (err) {
      setError(err.message || "请求失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  const parsedData = useMemo(() => {
    if (!result) {
      return null;
    }
    try {
      return JSON.parse(result);
    } catch {
      return null;
    }
  }, [result]);

  if (!show) {
    return null;
  }

  return (
    <aside className="aiPanel">
      <div className="aiPanelHeader">
        <h3>
          <Sparkles size={18} />
          AI 智能解读
        </h3>
        <button onClick={onClose} className="aiCloseBtn"><X size={18} /></button>
      </div>
      <div className="aiPanelContent">
        {loading && <AiLoadingStatus />}
        {error && <AiErrorStatus error={error} onRetry={fetchAnalysis} />}
        {!loading && !error && result && (
          parsedData ? (
            <AiTabbedContent data={parsedData} correctAnswer={current.answer || ""} />
          ) : (
            <MarkdownRenderer content={result} />
          )
        )}
      </div>
      {!loading && !error && result && (
        <AiChatSection
          messages={messages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          chatLoading={chatLoading}
          handleSendChat={handleSendChat}
          chatEndRef={chatEndRef}
        />
      )}
    </aside>
  );
}


// 模考题目头部区域组件
function MockQuestionHead({ idx, total, current, showRawHtml, setShowRawHtml, showAi, setShowAi }) {
  const subjectName = current.sources?.[0]?.subject || "全真模拟";
  const topicName = current.sources?.[0]?.topic || "自测题";

  return (
    <div className="questionHead">
      <div>
        <p>第 {idx + 1} / {total} 题</p>
        <h2>{formatSubjectName(subjectName)}</h2>
        <span>{topicName}</span>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          className={`iconButton ${showAi ? "active" : ""}`}
          onClick={() => { setShowAi(!showAi); }}
          title={showAi ? "关闭 AI 解析" : "AI 智能解析"}
        >
          <Sparkles size={22} />
        </button>
        <button
          className={`iconButton ${showRawHtml ? "active" : ""}`}
          onClick={() => {
            setShowRawHtml(!showRawHtml);
          }}
          title={showRawHtml ? "隐藏 Word 原文" : "对比 Word 原文"}
        >
          {showRawHtml ? <EyeOff size={22} /> : <Eye size={22} />}
        </button>
      </div>
    </div>
  );
}

// 模考题目选项与原文对比面板组件
function MockQuestionBody({
  current,
  selectedOption,
  chooseOption,
  showRawHtml,
  compareTab,
  setCompareTab
}) {
  return (
    <article className="questionBody">
      <p className="stem">{current.stem}</p>
      <div className="options" style={{ marginBottom: "20px" }}>
        {current.options.map((option) => {
          const picked = selectedOption === option.key;
          return (
            <button
              key={option.key}
              className={`option ${picked ? "picked" : ""}`}
              onClick={() => {
                chooseOption(option.key);
              }}
            >
              <span className="letter">{option.key}</span>
              <span>{option.text}</span>
            </button>
          );
        })}
      </div>

      {showRawHtml && (
        <RawHtmlPanel
          current={current}
          compareTab={compareTab}
          setCompareTab={setCompareTab}
        />
      )}
    </article>
  );
}

// 模考底部导航按钮与答题进度卡组件
function MockExamFooter({ idx, total, setIdx, submitExam, questions, answers }) {
  return (
    <>
      <nav
        className="bottomBar"
        style={{
          position: "static",
          width: "100%",
          transform: "none",
          marginTop: "24px"
        }}
      >
        <button
          onClick={() => {
            setIdx(Math.max(0, idx - 1));
          }}
          disabled={idx <= 0}
        >
          上一题
        </button>
        <button onClick={submitExam} style={{ background: "var(--accent-2)" }}>
          提交试卷
        </button>
        <button
          onClick={() => {
            setIdx(Math.min(total - 1, idx + 1));
          }}
          disabled={idx >= total - 1}
        >
          下一题
        </button>
      </nav>
      <MockAnswerSheet
        questions={questions}
        answers={answers}
        currentIdx={idx}
        setCurrentIdx={setIdx}
      />
    </>
  );
}

// 模考视图主容器组件
function MockExamView({ mockExam, setMockExam, store, setStore }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(mockExam.answers);
  const [timeLeft, setTimeLeft] = useState(mockExam.timeRemaining);
  const [showRawHtml, setShowRawHtml] = useState(false);
  const [compareTab, setCompareTab] = useState("image");
  const [showAi, setShowAi] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, []);

  const current = mockExam.questions[idx];

  // 选项点击事件处理
  function chooseOption(key) {
    const nextAnswers = [...selected];
    nextAnswers[idx] = key;
    setSelected(nextAnswers);
  }

  // 交卷统计分数
  function submitExam() {
    let correct = 0;
    mockExam.questions.forEach((q, i) => {
      const standard = normalizeAnswer(q.answer);
      const user = normalizeAnswer(selected[i]);
      if (standard && user === standard) {
        correct += 1;
      }
    });
    const score = (correct / mockExam.questions.length) * 75;
    const passed = score >= mockExam.threshold;
    
    setStore((prev) => {
      const mockResults = { ...(prev.mockResults || {}) };
      mockResults[mockExam.id] = { score, passed, date: Date.now() };
      return { ...prev, mockResults };
    });
    setMockExam(null);
  }

  return (
    <div style={{ marginTop: "14px" }} className={`mainAndAiLayout ${showAi ? "withAi" : ""}`}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <MockExamHeader mockExam={mockExam} timeLeft={timeLeft} />
        <div className="mockExamSurface">
          <MockQuestionHead
            idx={idx}
            total={mockExam.questions.length}
            current={current}
            showRawHtml={showRawHtml}
            setShowRawHtml={setShowRawHtml}
            showAi={showAi}
            setShowAi={setShowAi}
          />
          <MockQuestionBody
            current={current}
            selectedOption={selected[idx]}
            chooseOption={chooseOption}
            showRawHtml={showRawHtml}
            compareTab={compareTab}
            setCompareTab={setCompareTab}
          />
          <MockExamFooter
            idx={idx}
            total={mockExam.questions.length}
            setIdx={setIdx}
            submitExam={submitExam}
            questions={mockExam.questions}
            answers={selected}
          />
        </div>
      </div>
      <AiAnalysisPanel
        current={current}
        show={showAi}
        onClose={() => { setShowAi(false); }}
      />
    </div>
  );
}

// 刷题模式题目头部组件
function QuizQuestionHead({
  index,
  total,
  current,
  currentYearLabel,
  showRawHtml,
  setShowRawHtml,
  bookmarked,
  toggleBookmark,
  showAi,
  setShowAi
}) {
  const subjectName = current.sources?.[0]?.subject || "未分类";
  const topicName = current.sources?.[0]?.topic || current.section || "练习题";
  return (
    <div className="questionHead">
      <div>
        <p>{index + 1} / {total}</p>
        <h2>{formatSubjectName(subjectName)}</h2>
        <span>{currentYearLabel}{topicName}</span>
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          className={`iconButton ${showAi ? "active" : ""}`}
          onClick={() => { setShowAi(!showAi); }}
          title={showAi ? "关闭 AI 解析" : "AI 智能解析"}
        >
          <Sparkles size={22} />
        </button>
        <button
          className={`iconButton ${showRawHtml ? "active" : ""}`}
          onClick={() => { setShowRawHtml(!showRawHtml); }}
          title={showRawHtml ? "隐藏 Word 原文" : "对比 Word 原文"}
        >
          {showRawHtml ? <EyeOff size={22} /> : <Eye size={22} />}
        </button>
        <button className="iconButton" onClick={toggleBookmark} title="收藏">
          {bookmarked ? <BookmarkCheck size={22} /> : <Bookmark size={22} />}
        </button>
      </div>
    </div>
  );
}

// 刷题模式题目内容及选项与原文对比面板组件
function QuizQuestionBody({
  current,
  answer,
  selected,
  revealed,
  choose,
  showRawHtml,
  compareTab,
  setCompareTab
}) {
  return (
    <article className="questionBody">
      <p className="stem">{current.stem}</p>
      {answer.length > 1 && <p className="hint">本题可能包含多个空，按组合答案作答。</p>}
      <div className="options">
        {current.options.map((option) => {
          const pickedOption = selected.includes(option.key);
          const trueOption = answer.includes(option.key);
          const className = [
            "option",
            pickedOption ? "picked" : "",
            revealed && trueOption ? "right" : "",
            revealed && pickedOption && !trueOption ? "wrong" : "",
          ].filter(Boolean).join(" ");
          return (
            <button key={option.key} className={className} onClick={() => { choose(option.key); }}>
              <span className="letter">{option.key}</span>
              <span>{option.text}</span>
            </button>
          );
        })}
      </div>
      {showRawHtml && (
        <RawHtmlPanel
          current={current}
          compareTab={compareTab}
          setCompareTab={setCompareTab}
        />
      )}
    </article>
  );
}

// 刷题模式结果与上一次进度展示组件
function QuizResultPanel({ revealed, isCorrect, answer, picked, current, progress }) {
  const explanation = current.explanation || "";
  const sourceFile = current.sources?.[0]?.file || "";
  return (
    <>
      {revealed && (
        <section className={isCorrect ? "result ok" : "result bad"}>
          <div className="resultTitle">
            {isCorrect ? <Check size={20} /> : <X size={20} />}
            <strong>{isCorrect ? "答对了" : "再看一眼"}</strong>
          </div>
          <p>正确答案：<b>{answer}</b>{picked ? `，你的答案：${picked}` : ""}</p>
          {explanation && <p>{explanation}</p>}
          <p className="sourceText">{sourceFile}</p>
        </section>
      )}

      {progress && !revealed && (
        <p className={progress.last ? "prior okText" : "prior badText"}>
          上次{progress.last ? "答对" : "答错"}，累计 {progress.correct}/{progress.attempts}
        </p>
      )}
    </>
  );
}

// 刷题模式底部控制栏组件
function QuizBottomBar({ index, total, move, submit, randomize, revealed, current, selected, resetCurrent, clearStudyState }) {
  const disableSubmit = !current || !selected.length || revealed;
  return (
    <>
      <nav className="bottomBar">
        <button onClick={() => { move(-1); }} disabled={index <= 0}><ChevronLeft size={20} />上一题</button>
        <button onClick={submit} disabled={disableSubmit}>提交</button>
        <button onClick={randomize}><Shuffle size={18} />随机</button>
        <button onClick={() => { move(1); }} disabled={index >= total - 1}>下一题<ChevronRight size={20} /></button>
      </nav>

      <footer className="utility">
        <button onClick={resetCurrent}><RotateCcw size={16} />重答本题</button>
        <button onClick={clearStudyState}>清空记录</button>
      </footer>
    </>
  );
}

// 刷题模式的主显示视图组件
function QuizView({
  filtered,
  order,
  index,
  selected,
  revealed,
  current,
  answer,
  picked,
  isCorrect,
  progress,
  bookmarked,
  currentYearLabel,
  showRawHtml,
  setShowRawHtml,
  compareTab,
  setCompareTab,
  resetCurrent,
  move,
  randomize,
  choose,
  submit,
  toggleBookmark,
  clearStudyState,
  showAi,
  setShowAi
}) {
  if (!current) {
    return <div className="empty">当前筛选没有题目</div>;
  }
  return (
    <div className={`mainAndAiLayout ${showAi ? "withAi" : ""}`}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <main className="quizSurface">
          <QuizQuestionHead
            index={index}
            total={filtered.length}
            current={current}
            currentYearLabel={currentYearLabel}
            showRawHtml={showRawHtml}
            setShowRawHtml={setShowRawHtml}
            bookmarked={bookmarked}
            toggleBookmark={toggleBookmark}
            showAi={showAi}
            setShowAi={setShowAi}
          />
          <QuizQuestionBody
            current={current}
            answer={answer}
            selected={selected}
            revealed={revealed}
            choose={choose}
            showRawHtml={showRawHtml}
            compareTab={compareTab}
            setCompareTab={setCompareTab}
          />
          <QuizResultPanel
            revealed={revealed}
            isCorrect={isCorrect}
            answer={answer}
            picked={picked}
            current={current}
            progress={progress}
          />
        </main>
        <QuizBottomBar
          index={index}
          total={order.length}
          move={move}
          submit={submit}
          randomize={randomize}
          revealed={revealed}
          current={current}
          selected={selected}
          resetCurrent={resetCurrent}
          clearStudyState={clearStudyState}
        />
      </div>
      <AiAnalysisPanel
        current={current}
        show={showAi}
        onClose={() => { setShowAi(false); }}
      />
    </div>
  );
}

/**
 * 对章节或学科名称进行自然数字排序
 * 
 * @param {string} a 学科名称A
 * @param {string} b 学科名称B
 * @returns {number} 排序权值
 */
function sortSubjects(a, b) {
  const matchA = a.match(/#(\d+)/);
  const matchB = b.match(/#(\d+)/);
  if (matchA && matchB) {
    return parseInt(matchA[1], 10) - parseInt(matchB[1], 10);
  }
  if (matchA) {
    return -1;
  }
  if (matchB) {
    return 1;
  }
  return a.localeCompare(b, "zh-CN");
}

// 主应用程序入口组件
function App() {
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("all");
  const [year, setYear] = useState("all");
  const [mode, setMode] = useState("all");
  const [order, setOrder] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const [store, setStore] = useState(loadStore);
  const [showRawHtml, setShowRawHtml] = useState(false);
  const [compareTab, setCompareTab] = useState("image");
  const [view, setView] = useState("quiz");
  const [mockExam, setMockExam] = useState(null);
  const [showAi, setShowAi] = useState(false);

  useEffect(() => {
    fetch(`/questions.json?t=${Date.now()}`)
      .then((res) => {
        if (!res.ok) { throw new Error(`HTTP ${res.status}`); }
        return res.json();
      })
      .then(setData)
      .catch((error) => { setLoadError(error.message); });
  }, []);

  useEffect(() => {
    saveStore(store);
  }, [store]);

  const questions = data?.questions || [];
  const stats = data?.meta || {};
  const subjects = useMemo(() => {
    const names = [...new Set(questions.map((q) => { return q.sources?.[0]?.subject || "未分类"; }))];
    return names.sort(sortSubjects);
  }, [questions]);

  const years = useMemo(() => {
    const values = [...new Set(questions.flatMap((q) => { return q.years || []; }))];
    return values.sort((a, b) => { return Number(b) - Number(a); });
  }, [questions]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return questions.filter((q) => {
      const source = q.sources?.[0] || {};
      if (subject !== "all" && source.subject !== subject) { return false; }
      if (year !== "all" && !(q.years || []).includes(year)) { return false; }
      if (mode === "wrong" && !store.wrong?.[q.id]) { return false; }
      if (mode === "bookmarked" && !store.bookmarks?.[q.id]) { return false; }
      if (!keyword) { return true; }
      const text = [
        q.stem,
        q.section,
        source.subject,
        source.topic,
        source.file,
        ...(q.years || []),
        ...q.options.map((o) => { return o.text; }),
      ].join(" ").toLowerCase();
      return text.includes(keyword);
    });
  }, [questions, subject, year, mode, query, store]);

  const filterSignature = useMemo(() => {
    const wrongKey = mode === "wrong" ? Object.keys(store.wrong || {}).sort().join(",") : "";
    const bookmarkKey = mode === "bookmarked" ? Object.keys(store.bookmarks || {}).sort().join(",") : "";
    return [questions.length, subject, year, mode, query.trim().toLowerCase(), wrongKey, bookmarkKey].join("|");
  }, [questions.length, subject, year, mode, query, store.wrong, store.bookmarks]);

  useEffect(() => {
    setOrder(filtered.map((_, i) => { return i; }));
    setIndex(0);
    setSelected([]);
    setRevealed(false);
  }, [filterSignature]);

  const current = filtered[order[index] ?? 0];
  const answer = normalizeAnswer(current?.answer);
  const picked = normalizeAnswer(selected.join(""));
  const isCorrect = revealed && picked === answer;
  const progress = current ? store.progress?.[current.id] : null;
  const bookmarked = current ? Boolean(store.bookmarks?.[current.id]) : false;
  const currentYearLabel = current?.years?.length ? `${current.years.join(" / ")}年 · ` : "";

  function resetCurrent() {
    setSelected([]);
    setRevealed(false);
  }

  function move(delta) {
    if (!filtered.length) { return; }
    const next = Math.max(0, Math.min(order.length - 1, index + delta));
    setIndex(next);
    resetCurrent();
  }

  function randomize() {
    setOrder(shuffle(filtered.map((_, i) => { return i; })));
    setIndex(0);
    resetCurrent();
  }

  function choose(key) {
    if (!current || revealed) { return; }
    const multi = answer.length > 1;
    setSelected((prev) => {
      if (!multi) { return [key]; }
      return prev.includes(key) ? prev.filter((x) => { return x !== key; }) : [...prev, key];
    });
  }

  function submit() {
    if (!current || !selected.length) { return; }
    const ok = picked === answer;
    setRevealed(true);
    setStore((prev) => {
      const progressMap = { ...(prev.progress || {}) };
      const old = progressMap[current.id] || { attempts: 0, correct: 0 };
      progressMap[current.id] = {
        attempts: old.attempts + 1,
        correct: old.correct + (ok ? 1 : 0),
        last: ok,
        lastAnswer: picked,
        updatedAt: Date.now(),
      };
      const wrong = { ...(prev.wrong || {}) };
      if (ok) { delete wrong[current.id]; }
      else { wrong[current.id] = true; }
      return { ...prev, progress: progressMap, wrong };
    });
  }

  function toggleBookmark() {
    if (!current) { return; }
    setStore((prev) => {
      const bookmarks = { ...(prev.bookmarks || {}) };
      if (bookmarks[current.id]) { delete bookmarks[current.id]; }
      else { bookmarks[current.id] = true; }
      return { ...prev, bookmarks };
    });
  }

  function clearStudyState() {
    setStore({});
    resetCurrent();
  }

  if (loadError) {
    return <Shell view={view} setView={setView}><div className="empty">题库加载失败：{loadError}</div></Shell>;
  }

  if (!data) {
    return <Shell view={view} setView={setView}><div className="empty">正在加载题库</div></Shell>;
  }

  return (
    <Shell view={view} setView={setView}>
      {mockExam ? (
        <MockExamView
          mockExam={mockExam}
          setMockExam={setMockExam}
          store={store}
          setStore={setStore}
        />
      ) : view === "plan" ? (
        <PlanDashboard
          store={store}
          setStore={setStore}
          questions={questions}
          setSubject={setSubject}
          setYear={setYear}
          setQuery={setQuery}
          setMode={setMode}
          setView={setView}
          setMockExam={setMockExam}
        />
      ) : (
        <>
          <section className="topBand">
            <div>
              <p className="eyebrow">本地题库</p>
              <h1>软考软件设计师</h1>
            </div>
            <div className="metricGrid">
              <Metric label="可刷题" value={stats.questions || questions.length} />
              <Metric label="已答" value={Object.keys(store.progress || {}).length} />
              <Metric label="错题" value={Object.keys(store.wrong || {}).length} />
            </div>
          </section>

          <section className="filters" aria-label="筛选">
            <label className="searchBox">
              <Search size={18} />
              <input value={query} onChange={(e) => { setQuery(e.target.value); }} placeholder="搜索题干、章节、选项" />
            </label>
            <label className="selectBox">
              <ListFilter size={18} />
              <select value={subject} onChange={(e) => { setSubject(e.target.value); }}>
                <option value="all">全部章节</option>
                {subjects.map((name) => { return <option key={name} value={name}>{formatSubjectName(name)}</option>; })}
              </select>
            </label>
            <label className="selectBox">
              <CalendarDays size={18} />
              <select value={year} onChange={(e) => { setYear(e.target.value); }}>
                <option value="all">全部年份</option>
                {years.map((value) => { return <option key={value} value={value}>{value}年</option>; })}
              </select>
            </label>
            <div className="segmented">
              {[
                ["all", "全部"],
                ["wrong", "错题"],
                ["bookmarked", "收藏"],
              ].map(([val, label]) => {
                return (
                  <button key={val} className={mode === val ? "active" : ""} onClick={() => { setMode(val); }}>
                    {label}
                  </button>
                );
              })}
            </div>
          </section>

          <QuizView
            filtered={filtered}
            order={order}
            index={index}
            setIndex={setIndex}
            selected={selected}
            setSelected={setSelected}
            revealed={revealed}
            setRevealed={setRevealed}
            store={store}
            setStore={setStore}
            current={current}
            answer={answer}
            picked={picked}
            isCorrect={isCorrect}
            progress={progress}
            bookmarked={bookmarked}
            currentYearLabel={currentYearLabel}
            showRawHtml={showRawHtml}
            setShowRawHtml={setShowRawHtml}
            compareTab={compareTab}
            setCompareTab={setCompareTab}
            resetCurrent={resetCurrent}
            move={move}
            randomize={randomize}
            choose={choose}
            submit={submit}
            toggleBookmark={toggleBookmark}
            clearStudyState={clearStudyState}
            showAi={showAi}
            setShowAi={setShowAi}
          />
        </>
      )}
    </Shell>
  );
}

// 通用页面容器壳组件
function Shell({ children, view, setView }) {
  return (
    <div className="appShell">
      <header className="appHeader">
        <div>
          <strong>软考题库</strong>
          <span>章节练习</span>
        </div>
        <div className="navTabs">
          <button
            className={view === "quiz" ? "active" : ""}
            onClick={() => { setView("quiz"); }}
          >
            刷题模式
          </button>
          <button
            className={view === "plan" ? "active" : ""}
            onClick={() => { setView("plan"); }}
          >
            备战计划
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}

// 统计度量展示块组件
function Metric({ label, value }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
