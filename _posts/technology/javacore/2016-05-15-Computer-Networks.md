---
layout: post
title: 计算机网络 
category: javacore
tags: network
keywords: 
description: 
---



网络是由若干节点和链接这些结点的链路组成。网络中的结点可以是计算机，集线器，交换机或路由器等。

网络和网络通过路由器链接形成互联网。

第一阶段是单个网络

第二阶段是三级结构的因特网。分为主干网，地区网和校园网。

第三阶段形成多层次ISP结构的因特网。

ISP Internet Service Provider 因特网服务提供商

NAP Network Access Point网络接入点

路由器 router是实现分组交换packet switching的关键，任务是转发收到的分组，这是网络核心部分最重要的功能。


电路交换：

建立链接（占用通信资源）-通话（一直占用）释放链接（归还资源，三个步骤的交换方式成为电路交换。然后电话于电话之间通过交换机来构成链接。
电路交换的一个重要特点就是通话的全部时间内，通话的两个用户始终占用端到端的通信资源。

分组交换采用存储转发技术，要发的整块数据成为报文，发送报文前，将教程报文切分一个个更小的等长数据段。然后在数据段前面加上必要的控制信息组成的头部（header），就构成了一个分组（packet）,也称为包、分组的头部称为包头。分组是在因特网传输的数据单元。首部非常重要，包含了诸如目的地址，原地址等信息，才能选择传输路径。

主机是用户进行信息处理的，并且和其他主机通过网络交换信息。

路有钱则是用来转发分组的，即进行分组交换的。路由器收到一个分组，先存储起来，检查头部，查找转发表，按照首部中的目的地址，找到合适的接口转发出去，把分组交给下一个路由器，直到达到最终的目的地。各个路由器之间必须经常彼此交换掌握的路由信息，一边创建和维持在路由器中的转发表，是的转发表能够在整个网络拓扑发送变化时及时更新。

采用存储转发的分组交换，实质上是采用了在数据通信的过程中断续或者动态分配传输宽带的策略。因为如果网络中的某些结点或者链路突然出故障，在个路与怄气中运行的路由选择协议能自动找到其他路径转发出去。因特网使用网状拓扑结构，提高可靠性和使用率。

网络性能的指标
1.速率
2.贷款

3.吞吐量
throughpu，单位时间内通过某网络的数数量
4.延时
发送时延是主机或者路由器发送数据帧所需要的时间，也就是从发送数据帧的第一个比特算起到最后一个比特发送完毕的时间
传播时延
是电磁波在信道中传播一定距离所话费的时间。
处理时延
排队时延


分层思想
分层可将庞大而复杂的问题在不同的层次上进行切分，然后在没个层次上分别进行研究和解决问题、
分层的好处
1各层之间是独立的。A层于层通过接口提供服务。B每一层只实现一种相对对立的问题、
2.灵活性好。此层改变时，其他层不受影响，甚至可以取消此层。
3.结构可分割，使用最合适的技术实现
4.已于实现和尾货。
5.标准化工作。

网络协议
为进行网络中的数据交换而建议的规则，标准或者约定。
1.语法，数据于控制信息的结构或格式
2.语义 需要发出何种控制信息，完成何种动作以及何种响应
3.同步，事件实现顺序的详细说明


TCP/IP是四层结构，包括应用层，运输层，网际层和网路接口层。
应用层：
直接为用户的应用进程提供服务。

运输层：
负责两个主机中进程之间的通信提供服务。
运输层使用以下两种协议
TCP
UDP

网络层：
负责为分组交换网上的不同主机提供通信服务。网络层把运输层产生的报文段或者用户数据报封装成分组或包进行传送。

链路层：
两个主机之间的数据传输在链路上进行，链路层将网络层交下来的IP数据报组装成帧，framing，

物理层：


协议：
是水平的，两个对等实体间的通信在本层能够向上一层提供服务，协议和服务的概念是不一样的，一定要弄清楚。
服务是垂直的，由下层向通过层间接口提供。服务也有可见性。


物理层：

数据链路层：

封装成帧就是在一段数据的前后分别添加头部和尾部。

ASCII码是7位，可以组成128个不同的ASCII码。可打印的95个，不可打印的控制字符33个。

为了SOH和EOT不被解释为控制字符，加上转移字符ESC，这种称为字节填充。如果转义字符出现了，也在添加一个，拆包的时候去掉一个。

错检测
铜线链路会造成比特差错，就是0变成1,，误码率在10的-10次方。使用CRC（Cyclic Redundancy Check）循环冗余检验。

CRC原理














































