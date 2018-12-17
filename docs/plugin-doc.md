# 计划插件列表

这是一份建议各位开发者着手去实现/完善的插件列表，它整理了迄今为止论坛用户所需要的各种功能插件，罗列在此文档中。

此列表中的插件不一定已经实现；如果有人着手实现了新的在此列表中已提及的插件，可以往对应的插件条目中标注此插件已实现，以及插件的作者、具体在 plugin 文件夹的位置等。

插件作者在写好一个新的插件并对此仓库发起合并请求时，不仅要将写好的插件源码放在 plugin/作者名/插件名 文件夹下，而且也需要同时往此文件写入此插件源代码所属的插件条目。在写入插件条目有关此插件源代码的信息时，必须同时写作者信息，而且需要提供作者的真实有效、对应于本人的 MCBBS 账号 UID，提供的账号不限用户组。如果不符合此要求，拒绝合并。

此列表随时有可能追加新的插件，但有一些插件不得写入此插件名单，并且本仓库也不允许上传有关此类插件的源码。所有提交的插件都会进行审核，有以下任何行为之一的将拒绝合并并给出问题代码位置与理由：

- 以攻击论坛服务器为目的的
- 以盗取用户密码、Cookie 或其它任何不公开的隐私信息为目的的
- 未经用户允许篡改用户所拥有权限下的任何数据的（例如已发布的帖子、回复）
- 未经用户允许对用户积分进行操作的（例如未经允许对他人评分、对其它账户赠送道具）
- 未经用户允许发布表单的（例如未经允许进行发帖、举报、顶帖、使用道具）
- 利用客户端漏洞对用户的机器进行任何与客户端功能不相干的违规行为的（例如获取用户真实机器信息、发送用户机器上的任何非客户端创建的文件等）

该列表随时予以补充。

除列表正文条目中的内容以外的其它修改请求，对应的合并请求将无条件拒绝。

强烈建议通过使用此库的 CLI 创建新的插件，在插件上传的同时再改动此列表。

> 待编辑