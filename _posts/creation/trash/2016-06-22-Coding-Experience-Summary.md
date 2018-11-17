---
layout: page
breadcrumb: true
title: 写代码经验的一些总结
category: trash
categoryStr: 废弃
tags: 
keywords: 
description: 
---


如果一段代码，你看上去感觉怪怪的，那这一定是一段糟糕的代码。

我终于找到，我TM代码写的怪怪的原因了。


###　1.程序没有将每一条路径考虑进去。

比如这段代码，实现的是：如果没有此终端号sn的箱格，将此sn的所有箱格信息载入。如果有此sn对应的箱格，直接返回。

```

private void loadTerminalBox(String sn) throws ApplicationException {
	Map<Object, Object> boxMaps = redisService.hEntry(sn );
	if (null == boxMaps || boxMaps .isEmpty()) {
		 List<BoxVo> boxList = boxDao.selectBySn(sn );
		if (null != boxList && boxList.size() > 0) {
			 for (BoxVo boxVo : boxList ) {
				String boxId = boxVo.getBoxId();
			redisService.hput(sn , boxId , boxVo.toString());
			}
		}
	}
}

```

但是这段代码，只能看出一条路径，就是如果没有此sn对应的箱格会如何操作，而有sn对应的箱格，该如何做，没有代码表明这条路径。

改正后的代码：

```

private void loadTerminalBox(String sn) throws ApplicationException {
	Map<Object, Object> boxMaps = redisService.hEntry(sn );
	if (null != boxMaps && boxMaps.size() > 0) {
		return;
	}
	List<BoxVo> boxList = boxDao.selectBySn( sn);
	if (null == boxList || boxList .isEmpty()) {
		return;
	}
	for (BoxVo boxVo : boxList ) {
		String boxId = boxVo. getBoxId();
		redisService.hput(sn , boxId , boxVo.toString());
	}
}

```

看看是不是好很多？下面一段代码的优点在，第一：所有的执行路径都有，第二：没有多层if嵌套。

