/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2026-08-02 14:47:56
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2026-08-02 14:47:57
 * @FilePath: \yy\忍者必须死3\assets\js\招募加入.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/*
 * 快乐是种天赋 - 招募加入页脚本
 * 忍者必须死3 玩家自制页面
 */

function submitForm() {
    var nick = document.getElementById('nick').value.trim();
    var ninja = document.getElementById('ninja').value;
    var contact = document.getElementById('contact').value.trim();

    if (nick === '') {
        alert('请输入游戏昵称');
        return false;
    }
    if (ninja === '') {
        alert('请选择主玩忍者');
        return false;
    }
    if (contact === '') {
        alert('请留下联系方式');
        return false;
    }

    alert('申请已提交！族长会在24小时内联系你~');
    return false;
}
