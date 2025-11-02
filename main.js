import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import { createRealisticSkeleton, createRealisticHeart } from './modelLoader.js';
import { createLungs, createLiver, createStomach } from './organs.js';

// 场景设置
let scene, camera, renderer, controls, composer;
let heartGroup, lungsGroup, liverGroup, stomachGroup;  // 骨骼系统已移除
let arterySystem, veinSystem, capillarySystem;
let bloodParticles = [];
let raycaster, mouse;
let animationSpeed = 1.0;
let isCirculationPlaying = true;

// 知识库
const knowledgeBase = {
    skeleton: {
        title: "🚫 骨骼系统已移除",
        content: `
            <h3>📌 教学说明</h3>
            <p>为了更清晰地展示<span class="highlight">循环系统</span>，骨骼系统已从模型中完全移除。</p>
            
            <h3>🎯 当前显示的系统</h3>
            <p>• <span class="highlight">心脏</span>：生命的动力泵</p>
            <p>• <span class="highlight">动脉系统</span>：红色，从心脏输出</p>
            <p>• <span class="highlight">静脉系统</span>：蓝色，回流心脏</p>
            <p>• <span class="highlight">毛细血管</span>：紫色，连接动脉和静脉</p>
            <p>• <span class="highlight">其他器官</span>：肺、肝脏、胃</p>
            
            <h3>✨ 优点</h3>
            <p>• 无遮挡，完全可见血管网络</p>
            <p>• 清晰观察血液循环路径</p>
            <p>• 更好地理解心脏与血管的连接</p>
        `
    },
    heart: {
        title: "❤️ 心脏 - 生命的动力泵",
        content: `
            <h3>🫀 心脏的位置和大小</h3>
            <p>心脏位于<span class="highlight">胸腔中部偏左</span>，大小约<span class="highlight">本人拳头</span>大小，重约<span class="highlight">250-350克</span>。</p>
            
            <h3>🏛️ 心脏的四个腔室</h3>
            <p><strong>左心房</strong>（薄壁）：</p>
            <p>• 接收来自<span class="highlight">肺静脉</span>的富氧血液</p>
            <p>• 通过<span class="highlight">二尖瓣</span>流入左心室</p>
            
            <p><strong>左心室</strong>（壁最厚，约10-15mm）：</p>
            <p>• 人体最强大的泵室</p>
            <p>• 将血液泵入<span class="highlight">主动脉</span>，送往全身</p>
            <p>• 收缩压可达<span class="highlight">120mmHg</span></p>
            
            <p><strong>右心房</strong>（薄壁）：</p>
            <p>• 接收来自<span class="highlight">上下腔静脉</span>的缺氧血液</p>
            <p>• 通过<span class="highlight">三尖瓣</span>流入右心室</p>
            
            <p><strong>右心室</strong>（壁较薄，约3-5mm）：</p>
            <p>• 将血液泵入<span class="highlight">肺动脉</span>，送往肺部</p>
            <p>• 压力较低，因为肺部距离近</p>
            
            <h3>🚪 心脏的四个瓣膜（防止血液倒流）</h3>
            <p>• <span class="highlight">二尖瓣</span>：左心房→左心室</p>
            <p>• <span class="highlight">三尖瓣</span>：右心房→右心室</p>
            <p>• <span class="highlight">主动脉瓣</span>：左心室→主动脉</p>
            <p>• <span class="highlight">肺动脉瓣</span>：右心室→肺动脉</p>
            
            <h3>🔴 冠状动脉（心脏的供血系统）</h3>
            <p>心脏自己也需要血液供应！</p>
            <p>• <span class="highlight">左冠状动脉</span>：</p>
            <p>  - 前降支（LAD）：供应左心室前壁</p>
            <p>  - 回旋支（LCX）：供应左心室侧壁</p>
            <p>• <span class="highlight">右冠状动脉</span>（RCA）：供应右心室</p>
            <p><strong>⚠️ 冠状动脉堵塞会导致心肌梗死（心梗）</strong></p>
            
            <h3>💓 心脏的工作原理</h3>
            <p><strong>收缩期（Systole）</strong>：</p>
            <p>• 心室收缩，将血液泵出</p>
            <p>• 左心室→主动脉→全身</p>
            <p>• 右心室→肺动脉→肺部</p>
            
            <p><strong>舒张期（Diastole）</strong>：</p>
            <p>• 心室舒张，接收血液</p>
            <p>• 肺静脉→左心房→左心室</p>
            <p>• 腔静脉→右心房→右心室</p>
            
            <h3>📊 心脏的数据</h3>
            <p>• 每天跳动：<span class="highlight">约10万次</span></p>
            <p>• 每分钟跳动：<span class="highlight">60-100次</span>（成人静息）</p>
            <p>• 每次泵血量：<span class="highlight">70-80毫升</span></p>
            <p>• 每天泵血量：<span class="highlight">约7000升</span></p>
            <p>• 一生跳动：<span class="highlight">约25-30亿次</span></p>
            
            <h3>🎯 重点记忆</h3>
            <p>1. 左心室壁<span class="highlight">最厚</span>，因为要泵血到全身</p>
            <p>2. 血液只能<span class="highlight">单向流动</span>，瓣膜防止倒流</p>
            <p>3. 心脏有自己的<span class="highlight">冠状动脉</span>供血系统</p>
            <p>4. 心脏分<span class="highlight">左右两部分</span>，互不相通</p>
        `
    },
    lungs: {
        title: "肺 - 气体交换站",
        content: `
            <h3>🫁 肺的结构</h3>
            <p>肺是呼吸系统的主要器官，位于胸腔内，分为<span class="highlight">左肺</span>和<span class="highlight">右肺</span>。</p>
            
            <h3>结构特点</h3>
            <p>• <span class="highlight">右肺</span>：较大，分为三叶</p>
            <p>• <span class="highlight">左肺</span>：较小，分为两叶（为心脏留出空间）</p>
            <p>• <span class="highlight">肺泡</span>：约3亿个，总面积约70平方米</p>
            
            <h3>🌬️ 肺的功能</h3>
            <p>• 吸入氧气：通过肺泡将氧气送入血液</p>
            <p>• 排出二氧化碳：将血液中的废气排出体外</p>
            <p>• 调节血液pH值</p>
            
            <h3>💡 呼吸过程</h3>
            <p>成年人每天呼吸约<span class="highlight">2万次</span>，吸入约<span class="highlight">10000升</span>空气。</p>
        `
    },
    liver: {
        title: "肝脏 - 化学工厂",
        content: `
            <h3>🔶 肝脏的位置</h3>
            <p>肝脏是人体<span class="highlight">最大的内脏器官</span>，位于腹腔右上部，重约1.5公斤。</p>
            
            <h3>主要功能</h3>
            <p>• <span class="highlight">代谢功能</span>：参与糖、脂肪、蛋白质代谢</p>
            <p>• <span class="highlight">解毒作用</span>：分解有害物质</p>
            <p>• <span class="highlight">分泌胆汁</span>：帮助消化脂肪</p>
            <p>• <span class="highlight">储存营养</span>：储存维生素和糖原</p>
            <p>• <span class="highlight">凝血功能</span>：合成凝血因子</p>
            
            <h3>🔄 强大的再生能力</h3>
            <p>肝脏是唯一能够<span class="highlight">再生</span>的内脏器官，切除70%仍能恢复！</p>
            
            <h3>💡 趣味知识</h3>
            <p>肝脏每分钟要处理约<span class="highlight">1.5升</span>血液，承担着500多种生理功能。</p>
        `
    },
    stomach: {
        title: "胃 - 食物加工厂",
        content: `
            <h3>🔸 胃的位置和结构</h3>
            <p>胃位于腹腔左上部，是消化道最膨大的部分，容量约<span class="highlight">1-2升</span>。</p>
            
            <h3>胃的分部</h3>
            <p>• <span class="highlight">贲门</span>：连接食管</p>
            <p>• <span class="highlight">胃底</span>：胃的上部</p>
            <p>• <span class="highlight">胃体</span>：主要部分</p>
            <p>• <span class="highlight">幽门</span>：连接小肠</p>
            
            <h3>🍽️ 胃的功能</h3>
            <p>• <span class="highlight">储存食物</span>：暂时储存吃进的食物</p>
            <p>• <span class="highlight">机械消化</span>：胃的蠕动磨碎食物</p>
            <p>• <span class="highlight">化学消化</span>：分泌胃液（含胃酸和胃蛋白酶）</p>
            
            <h3>⚗️ 胃液的特点</h3>
            <p>胃液呈<span class="highlight">强酸性</span>（pH 1.5-2），能够杀灭细菌，初步消化蛋白质。</p>
        `
    },
    artery: {
        title: "🔴 动脉 - 血液高速公路",
        content: `
            <h3>🔴 动脉的定义</h3>
            <p>动脉是将血液从<span class="highlight">心脏输送到全身</span>各个器官的血管。</p>
            
            <h3>📏 结构特征（重要！）</h3>
            <p>• <span class="highlight">管壁厚</span>：能承受心脏泵血的高压（120mmHg）</p>
            <p>• <span class="highlight">弹性好</span>：富含弹性纤维，随心脏跳动而有节奏地搏动</p>
            <p>• <span class="highlight">管腔小</span>：相对较小，保持较高的血压</p>
            <p>• <span class="highlight">无静脉瓣</span>：血流方向由心脏泵力维持</p>
            
            <h3>🌟 主要动脉</h3>
            <p>• <span class="highlight">主动脉</span>：人体最粗的动脉（直径约2.5cm）</p>
            <p>• <span class="highlight">颈动脉</span>：供应头部和大脑</p>
            <p>• <span class="highlight">肺动脉</span>：⚠️ 唯一流<strong>静脉血</strong>的动脉！</p>
            <p>• 锁骨下动脉、股动脉、肠系膜动脉等</p>
            
            <h3>🩸 血液特点</h3>
            <p>• 除肺动脉外，动脉中流动的是<span class="highlight">鲜红色的动脉血</span></p>
            <p>• 富含<span class="highlight">氧气</span>（氧合血红蛋白呈鲜红色）</p>
            <p>• 血流速度<span class="highlight">快</span>，可感受到脉搏跳动</p>
            
            <h3>🎯 识别方法</h3>
            <p>1. <strong>颜色</strong>：在3D模型中显示为<span class="highlight" style="color:#ff3333;">鲜红色</span></p>
            <p>2. <strong>位置</strong>：从心脏向外延伸</p>
            <p>3. <strong>粗细</strong>：主动脉最粗，越远越细</p>
            <p>4. <strong>发光</strong>：红色发光效果</p>
            
            <h3>📊 数据</h3>
            <p>• 主动脉血流速度：约40cm/秒</p>
            <p>• 动脉血压：收缩压120mmHg，舒张压80mmHg</p>
            <p>• 动脉壁厚度：约2-3mm</p>
        `
    },
    vein: {
        title: "🔵 静脉 - 血液回流通道",
        content: `
            <h3>🔵 静脉的定义</h3>
            <p>静脉是将血液从<span class="highlight">全身各处送回心脏</span>的血管。</p>
            
            <h3>📏 结构特征（重要！）</h3>
            <p>• <span class="highlight">管壁薄</span>：承受的压力较小（10-20mmHg）</p>
            <p>• <span class="highlight">弹性小</span>：弹性纤维较少</p>
            <p>• <span class="highlight">管腔大</span>：便于血液回流</p>
            <p>• <span class="highlight">有静脉瓣</span>：⭐ 重点！防止血液倒流</p>
            
            <h3>🚪 静脉瓣的作用</h3>
            <p>静脉瓣像<span class="highlight">单向闸门</span>，只允许血液向心脏方向流动：</p>
            <p>• 防止血液因重力而倒流</p>
            <p>• 配合肌肉挤压帮助血液回流</p>
            <p>• 长期站立时尤其重要</p>
            <p>⚠️ 静脉瓣损坏会导致<span class="highlight">静脉曲张</span></p>
            
            <h3>🌟 主要静脉</h3>
            <p>• <span class="highlight">上腔静脉</span>：收集头部、上肢血液</p>
            <p>• <span class="highlight">下腔静脉</span>：收集腹部、下肢血液</p>
            <p>• <span class="highlight">肺静脉</span>：⚠️ 唯一流<strong>动脉血</strong>的静脉！</p>
            <p>• 门静脉、颈内静脉、股静脉等</p>
            
            <h3>🩸 血液特点</h3>
            <p>• 除肺静脉外，静脉中流动的是<span class="highlight">暗红色的静脉血</span></p>
            <p>• 缺乏<span class="highlight">氧气</span>，富含<span class="highlight">二氧化碳</span></p>
            <p>• 血流速度<span class="highlight">慢</span>，无明显脉搏</p>
            
            <h3>🎯 识别方法</h3>
            <p>1. <strong>颜色</strong>：在3D模型中显示为<span class="highlight" style="color:#3333ff;">蓝色</span></p>
            <p>2. <strong>位置</strong>：从全身向心脏汇聚</p>
            <p>3. <strong>管径</strong>：相对较粗，管腔大</p>
            <p>4. <strong>发光</strong>：蓝色发光效果</p>
            
            <h3>📊 数据</h3>
            <p>• 静脉血流速度：约20cm/秒</p>
            <p>• 静脉血压：10-20mmHg（很低）</p>
            <p>• 静脉壁厚度：约0.5-1mm</p>
            
            <h3>🔄 血液回流机制</h3>
            <p>1. <span class="highlight">心脏吸引力</span>：心脏舒张时产生负压</p>
            <p>2. <span class="highlight">肌肉挤压</span>：骨骼肌收缩挤压静脉</p>
            <p>3. <span class="highlight">静脉瓣</span>：防止血液倒流</p>
            <p>4. <span class="highlight">呼吸运动</span>：胸腔负压帮助回流</p>
        `
    },
    capillary: {
        title: "💜 毛细血管 - 物质交换站",
        content: `
            <h3>💜 毛细血管的定义</h3>
            <p>毛细血管是连接<span class="highlight">动脉和静脉</span>的最细小血管，是物质交换的场所。</p>
            
            <h3>📏 结构特征（考试重点！）</h3>
            <p>• <span class="highlight">管壁极薄</span>：只有<strong>一层上皮细胞</strong>（1细胞厚！）</p>
            <p>• <span class="highlight">管径极细</span>：8-10微米，仅能容纳<strong>一个红细胞</strong>通过</p>
            <p>• <span class="highlight">数量巨大</span>：全身约<strong>100亿根</strong></p>
            <p>• <span class="highlight">血流极慢</span>：0.5-1mm/秒，便于物质交换</p>
            <p>• <span class="highlight">无瓣膜</span>：不需要瓣膜</p>
            
            <h3>🔄 物质交换（最重要！）</h3>
            <p>毛细血管是血液与组织细胞之间进行物质交换的<span class="highlight">唯一场所</span>：</p>
            
            <p><strong>从血液→组织细胞：</strong></p>
            <p>• <span class="highlight">氧气</span>（O₂）</p>
            <p>• <span class="highlight">营养物质</span>（葡萄糖、氨基酸、脂肪酸等）</p>
            <p>• 激素、维生素等</p>
            
            <p><strong>从组织细胞→血液：</strong></p>
            <p>• <span class="highlight">二氧化碳</span>（CO₂）</p>
            <p>• <span class="highlight">代谢废物</span>（尿素、尿酸等）</p>
            
            <h3>❓ 为什么能交换？</h3>
            <p>1. <span class="highlight">管壁极薄</span>：只有1层细胞，容易渗透</p>
            <p>2. <span class="highlight">血流极慢</span>：有充足的时间进行交换</p>
            <p>3. <span class="highlight">数量巨大</span>：总表面积达500-700平方米</p>
            <p>4. <span class="highlight">分布广泛</span>：遍布全身各处，紧邻细胞</p>
            
            <h3>🌟 特殊的毛细血管网</h3>
            <p>• <span class="highlight">肺泡毛细血管</span>：气体交换（O₂、CO₂）</p>
            <p>• <span class="highlight">肠绒毛毛细血管</span>：吸收营养物质</p>
            <p>• <span class="highlight">肾小球毛细血管</span>：过滤血液，形成尿液</p>
            <p>• <span class="highlight">肝脏毛细血管</span>：代谢和解毒</p>
            
            <h3>🎯 识别方法</h3>
            <p>1. <strong>颜色</strong>：在3D模型中显示为<span class="highlight" style="color:#aa66ff;">紫色</span></p>
            <p>2. <strong>位置</strong>：围绕各个器官呈网状分布</p>
            <p>3. <strong>形态</strong>：细密的网状结构</p>
            <p>4. <strong>发光</strong>：紫色发光效果</p>
            
            <h3>📊 惊人数据</h3>
            <p>• 全身毛细血管总数：<span class="highlight">约100亿根</span></p>
            <p>• 总长度：<span class="highlight">约10万公里</span>（可绕地球2.5圈！）</p>
            <p>• 总表面积：<span class="highlight">500-700平方米</span>（网球场大小！）</p>
            <p>• 管径：<span class="highlight">8-10微米</span>（头发丝的1/10）</p>
            <p>• 血流速度：<span class="highlight">0.5-1mm/秒</span>（极慢）</p>
            
            <h3>💡 临床意义</h3>
            <p>• 毛细血管通透性增加→<span class="highlight">水肿</span></p>
            <p>• 毛细血管破裂→<span class="highlight">出血点</span></p>
            <p>• 糖尿病会损伤毛细血管</p>
        `
    },
    circulation: {
        title: "🔄 血液循环 - 生命的河流",
        content: `
            <h3>🩸 三种血管的对比</h3>
            
            <h3>🔴 1. 动脉（Artery）- 血液高速公路</h3>
            <p><strong>功能：</strong>将血液从<span class="highlight">心脏输送到</span>全身各处</p>
            
            <p><strong>结构特点：</strong></p>
            <p>• <span class="highlight">管壁厚</span>：能承受高血压（120mmHg）</p>
            <p>• <span class="highlight">弹性大</span>：富含弹性纤维，随心跳有节奏地搏动</p>
            <p>• <span class="highlight">管腔小</span>：相对较小，保持血流速度</p>
            <p>• <span class="highlight">无静脉瓣</span>：血流方向靠心脏泵力</p>
            
            <p><strong>主要动脉：</strong></p>
            <p>• <span class="highlight">主动脉</span>：人体最粗的动脉（直径约2.5cm）</p>
            <p>• <span class="highlight">颈动脉</span>：供应头部和大脑</p>
            <p>• <span class="highlight">肺动脉</span>：唯一流<span class="highlight">静脉血</span>的动脉！</p>
            <p>• 锁骨下动脉、肠系膜动脉、股动脉等</p>
            
            <p><strong>血液特点：</strong></p>
            <p>• 除肺动脉外，动脉中流的是<span class="highlight">鲜红色的动脉血</span></p>
            <p>• 动脉血富含<span class="highlight">氧气</span>，颜色鲜红</p>
            <p>• 血流速度快，脉搏明显</p>
            
            <h3>🔵 2. 静脉（Vein）- 血液回流通道</h3>
            <p><strong>功能：</strong>将血液从<span class="highlight">全身送回心脏</span></p>
            
            <p><strong>结构特点：</strong></p>
            <p>• <span class="highlight">管壁薄</span>：承受的血压小（10-20mmHg）</p>
            <p>• <span class="highlight">弹性小</span>：弹性纤维较少</p>
            <p>• <span class="highlight">管腔大</span>：便于血液回流</p>
            <p>• <span class="highlight">有静脉瓣</span>：<strong>重点！</strong>防止血液倒流</p>
            
            <p><strong>主要静脉：</strong></p>
            <p>• <span class="highlight">上腔静脉</span>：收集头部、上肢血液</p>
            <p>• <span class="highlight">下腔静脉</span>：收集腹部、下肢血液</p>
            <p>• <span class="highlight">肺静脉</span>：唯一流<span class="highlight">动脉血</span>的静脉！</p>
            <p>• 门静脉、股静脉、颈内静脉等</p>
            
            <p><strong>血液特点：</strong></p>
            <p>• 除肺静脉外，静脉中流的是<span class="highlight">暗红色的静脉血</span></p>
            <p>• 静脉血缺乏<span class="highlight">氧气</span>，富含<span class="highlight">二氧化碳</span></p>
            <p>• 血流速度慢，靠附近肌肉挤压回流</p>
            
            <h3>💜 3. 毛细血管（Capillary）- 物质交换站</h3>
            <p><strong>功能：</strong>连接动脉和静脉，进行<span class="highlight">物质交换</span></p>
            
            <p><strong>结构特点：</strong></p>
            <p>• <span class="highlight">管壁极薄</span>：只有<span class="highlight">一层上皮细胞</span>（1细胞厚）</p>
            <p>• <span class="highlight">管径极细</span>：8-10微米，仅容一个红细胞通过</p>
            <p>• <span class="highlight">数量巨大</span>：全身约<span class="highlight">100亿根</span></p>
            <p>• <span class="highlight">血流极慢</span>：0.5-1mm/秒，便于交换</p>
            
            <p><strong>物质交换：</strong></p>
            <p>• <span class="highlight">氧气</span>：血液→组织细胞</p>
            <p>• <span class="highlight">二氧化碳</span>：组织细胞→血液</p>
            <p>• <span class="highlight">营养物质</span>：血液→细胞</p>
            <p>• <span class="highlight">代谢废物</span>：细胞→血液</p>
            
            <h3>🔄 两条循环路径</h3>
            
            <p><strong>1️⃣ 体循环（大循环）</strong>：</p>
            <p><span class="highlight">左心室 → 主动脉 → 各级动脉 → 毛细血管 → 各级静脉 → 上下腔静脉 → 右心房</span></p>
            <p>• 路线长，输送营养和氧气到全身</p>
            <p>• 动脉血→静脉血（颜色变暗）</p>
            
            <p><strong>2️⃣ 肺循环（小循环）</strong>：</p>
            <p><span class="highlight">右心室 → 肺动脉 → 肺部毛细血管 → 肺静脉 → 左心房</span></p>
            <p>• 路线短，仅在肺部进行气体交换</p>
            <p>• 静脉血→动脉血（颜色变鲜）</p>
            <p>• <strong>特别注意</strong>：肺动脉流静脉血，肺静脉流动脉血！</p>
            
            <h3>📊 血液循环数据</h3>
            <p>• 循环一周时间：<span class="highlight">23秒</span></p>
            <p>• 全身血管总长度：<span class="highlight">10万公里</span>（绕地球2.5圈）</p>
            <p>• 全身血量：成人<span class="highlight">4-5升</span></p>
            <p>• 毛细血管总数：<span class="highlight">100亿根</span></p>
            
            <h3>💜 血液流速对比（重要！）</h3>
            <p><strong>🔴 动脉中的血液：</strong></p>
            <p>• 速度：<span class="highlight">40 cm/秒</span>（主动脉）</p>
            <p>• 特点：快速流动，有明显<span class="highlight">脉动</span></p>
            <p>• 比喻：像高速公路上的汽车</p>
            
            <p><strong>🔵 静脉中的血液：</strong></p>
            <p>• 速度：<span class="highlight">15 cm/秒</span></p>
            <p>• 特点：中等速度，靠<span class="highlight">静脉瓣 + 肌肉挤压</span>回流</p>
            <p>• 比喻：像普通公路上的车流</p>
            
            <p><strong>💜 毛细血管中的血液：</strong></p>
            <p>• 速度：<span class="highlight">0.5-1 mm/秒</span>（极慢！）</p>
            <p>• 特点：<span class="highlight">红细胞单文件通过</span>，便于物质交换</p>
            <p>• 比喻：像人慢慢走过狭窄过道</p>
            <p>• <strong>教学重点</strong>：这是考试必考知识点！</p>
            
            <h3>🔬 血管结构对比（观察右侧模型）</h3>
            <p><strong>动脉结构：</strong></p>
            <p>• 外膜：结缔组织，保护作用</p>
            <p>• 中膜：<span class="highlight">弹性纤维 + 平滑肌</span>（最厚）</p>
            <p>• 内膜：单层上皮细胞，光滑减少阻力</p>
            
            <p><strong>静脉结构：</strong></p>
            <p>• 外膜：较薄</p>
            <p>• 中膜：弹性纤维少，管壁薄</p>
            <p>• 内膜：形成<span class="highlight">静脉瓣</span>（防止血液倒流）</p>
            
            <p><strong>毛细血管结构：</strong></p>
            <p>• 管壁：<span class="highlight">仅一层细胞</span>（厚度约1微米）</p>
            <p>• 功能：薄壁便于<span class="highlight">物质通过</span>扩散交换</p>
            <p>• 直径：8-10微米（红细胞直径7微米）</p>
            
            <h3>🎯 考试重点对比</h3>
            <table style="width:100%; border-collapse: collapse; margin-top:10px;">
                <tr style="background:#1a2332;">
                    <th style="border:1px solid #444; padding:8px;">特征</th>
                    <th style="border:1px solid #444; padding:8px;">动脉</th>
                    <th style="border:1px solid #444; padding:8px;">静脉</th>
                    <th style="border:1px solid #444; padding:8px;">毛细血管</th>
                </tr>
                <tr>
                    <td style="border:1px solid #444; padding:8px;">管壁</td>
                    <td style="border:1px solid #444; padding:8px; color:#ff6666;"><strong>厚</strong></td>
                    <td style="border:1px solid #444; padding:8px; color:#6666ff;">薄</td>
                    <td style="border:1px solid #444; padding:8px; color:#aa66ff;"><strong>极薄</strong></td>
                </tr>
                <tr>
                    <td style="border:1px solid #444; padding:8px;">弹性</td>
                    <td style="border:1px solid #444; padding:8px; color:#ff6666;"><strong>大</strong></td>
                    <td style="border:1px solid #444; padding:8px; color:#6666ff;">小</td>
                    <td style="border:1px solid #444; padding:8px; color:#aa66ff;">无</td>
                </tr>
                <tr>
                    <td style="border:1px solid #444; padding:8px;">管腔</td>
                    <td style="border:1px solid #444; padding:8px; color:#ff6666;">小</td>
                    <td style="border:1px solid #444; padding:8px; color:#6666ff;"><strong>大</strong></td>
                    <td style="border:1px solid #444; padding:8px; color:#aa66ff;"><strong>极小</strong></td>
                </tr>
                <tr>
                    <td style="border:1px solid #444; padding:8px;">瓣膜</td>
                    <td style="border:1px solid #444; padding:8px; color:#ff6666;">无</td>
                    <td style="border:1px solid #444; padding:8px; color:#6666ff;"><strong>有</strong></td>
                    <td style="border:1px solid #444; padding:8px; color:#aa66ff;">无</td>
                </tr>
                <tr>
                    <td style="border:1px solid #444; padding:8px;">血流速度</td>
                    <td style="border:1px solid #444; padding:8px; color:#ff6666;"><strong>快</strong></td>
                    <td style="border:1px solid #444; padding:8px; color:#6666ff;">中</td>
                    <td style="border:1px solid #444; padding:8px; color:#aa66ff;"><strong>极慢</strong></td>
                </tr>
            </table>
        `
    },
    reset: {
        title: "人体系统概览",
        content: `
            <h3>🧬 人体八大系统</h3>
            <p>人体由多个系统协调工作，维持生命活动。</p>
            
            <h3>主要系统</h3>
            <p>• <span class="highlight">运动系统</span>：骨骼、肌肉、关节</p>
            <p>• <span class="highlight">循环系统</span>：心脏、血管、血液</p>
            <p>• <span class="highlight">呼吸系统</span>：鼻、咽、喉、气管、肺</p>
            <p>• <span class="highlight">消化系统</span>：口腔、食管、胃、肠</p>
            <p>• <span class="highlight">泌尿系统</span>：肾脏、输尿管、膀胱</p>
            <p>• <span class="highlight">神经系统</span>：大脑、脊髓、神经</p>
            <p>• <span class="highlight">内分泌系统</span>：各种腺体</p>
            <p>• <span class="highlight">生殖系统</span>：生殖器官</p>
            
            <h3>🤝 系统协作</h3>
            <p>各系统相互配合、相互影响，共同维持人体的生命活动和健康。</p>
        `
    }
};

// 初始化场景
function init() {
    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050510);  // 更深的背景
    
    // 添加雾效
    scene.fog = new THREE.FogExp2(0x050510, 0.015);

    // 创建相机
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 12, 25);  // 俯视角度观看平躺的骨骼

    // 创建渲染器 - 更高质量
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // 限制像素比以保证性能
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 添加后期处理
    composer = new EffectComposer(renderer);
    
    // 渲染通道
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    
    // 辉光效果（使器官发光）
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        0.6,  // 强度
        0.4,  // 半径
        0.85  // 阈值
    );
    composer.addPass(bloomPass);
    
    // 抗锯齿（SMAA）
    const smaaPass = new SMAAPass(window.innerWidth, window.innerHeight);
    composer.addPass(smaaPass);

    // 添加控制器
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 10;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI * 0.9;

    // 射线投射器（用于点击检测）
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // 添加光源
    addLights();

    // 创建3D模型 - 不包含骨骼系统，仅显示器官和血管
    // skeletonGroup = createRealisticSkeleton();  // 已移除骨骼系统
    // scene.add(skeletonGroup);
    
    heartGroup = createRealisticHeart();
    scene.add(heartGroup);
    
    lungsGroup = createLungs();
    scene.add(lungsGroup);
    
    liverGroup = createLiver();
    scene.add(liverGroup);
    
    stomachGroup = createStomach();
    scene.add(stomachGroup);
    
    createBloodVessels();
    createBloodFlow();

    // 添加环境装饰
    addEnvironment();

    // 事件监听
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onMouseClick);
    window.addEventListener('mousemove', onMouseMove);
    document.querySelectorAll('.control-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const part = e.target.dataset.part;
            focusOnPart(part);
        });
    });

    // 隐藏加载提示
    document.getElementById('loading').style.display = 'none';

    // 开始动画
    animate();
}

// 添加光源
function addLights() {
    // 环境光 - 较弱的环境光，让主光更突出
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // 主光源 - 模拟手术灯
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.5);
    mainLight.position.set(12, 18, 12);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 4096;
    mainLight.shadow.mapSize.height = 4096;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 60;
    mainLight.shadow.camera.left = -25;
    mainLight.shadow.camera.right = 25;
    mainLight.shadow.camera.top = 25;
    mainLight.shadow.camera.bottom = -25;
    mainLight.shadow.bias = -0.0001;
    scene.add(mainLight);

    // 补充光 1 - 冷色调
    const fillLight1 = new THREE.DirectionalLight(0x88bbff, 0.6);
    fillLight1.position.set(-12, 8, -12);
    scene.add(fillLight1);

    // 补充光 2 - 暖色调
    const fillLight2 = new THREE.DirectionalLight(0xffbb88, 0.4);
    fillLight2.position.set(8, -5, 8);
    scene.add(fillLight2);

    // 心脏内部光源 - 增强发光效果
    const heartLight = new THREE.PointLight(0xff2244, 3, 18);
    heartLight.position.set(0, 3, 0);
    scene.add(heartLight);

    // 动态光源 1（模拟血液流动 - 动脉）
    const flowLight1 = new THREE.PointLight(0xff4455, 2, 10);
    flowLight1.position.set(0, 8, 0);
    scene.add(flowLight1);
    
    // 动态光源 2（模拟血液流动 - 静脉）
    const flowLight2 = new THREE.PointLight(0x4455ff, 2, 10);
    flowLight2.position.set(0, -2, 0);
    scene.add(flowLight2);
    
    // 肺部光源
    const lungLightLeft = new THREE.PointLight(0xffaaaa, 1.5, 12);
    lungLightLeft.position.set(-2, 4, -1);
    scene.add(lungLightLeft);
    
    const lungLightRight = new THREE.PointLight(0xffaaaa, 1.5, 12);
    lungLightRight.position.set(2.2, 4, -1);
    scene.add(lungLightRight);
    
    // 顶部聚光灯
    const spotLight = new THREE.SpotLight(0xffffff, 1.5);
    spotLight.position.set(0, 20, 0);
    spotLight.angle = Math.PI / 6;
    spotLight.penumbra = 0.3;
    spotLight.decay = 2;
    spotLight.distance = 30;
    spotLight.castShadow = true;
    scene.add(spotLight);
}

// 创建血管系统 - 完全重构，确保连接
function createBloodVessels() {
    // ========== 动脉系统 - 从心脏出发的完整树状结构 ==========
    arterySystem = new THREE.Group();
    arterySystem.userData.type = 'artery';

    const arteryMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xff1a1a,
        emissive: 0xff0000,  // 增强红色发光边框
        emissiveIntensity: 0.8,  // 提高发光强度
        metalness: 0.05,
        roughness: 0.2,
        transparent: true,
        opacity: 0.15,  // 极低透明度，几乎透明，只保留红色边框
        clearcoat: 0.8,  // 增强边缘光泽
        clearcoatRoughness: 0.1,
        wireframe: false,
        side: THREE.DoubleSide
    });

    // 心脏位置：y=3 附近
    const heartCenter = new THREE.Vector3(0, 3, 0);
    
    // 1. 主动脉 - 从心脏左侧出发（完整连接）
    const aortaPath = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.3, 2.8, 0.2),   // 心脏左心室出口
        new THREE.Vector3(-0.2, 3.5, 0.3),   // 上升
        new THREE.Vector3(0, 4.5, 0.4),      // 继续上升
        new THREE.Vector3(0, 6, 0.5),        // 主动脉弓顶部
        new THREE.Vector3(0, 7.2, 0.3)       // 弓部结束
    ]);
    const aorta = new THREE.Mesh(
        new THREE.TubeGeometry(aortaPath, 50, 0.35, 16, false),
        arteryMaterial
    );
    aorta.userData.type = 'artery';
    aorta.castShadow = true;
    arterySystem.add(aorta);

    // 2. 主动脉弓分支 - 左右颈总动脉和锁骨下动脉（从主动脉分出）
    // 左锁骨下动脉
    const leftSubclavian = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 7, 0.35),       // 从主动脉弓分出
        new THREE.Vector3(-0.8, 7.1, 0.3),
        new THREE.Vector3(-1.5, 7, 0.2),
        new THREE.Vector3(-2.5, 6.5, 0.5)
    ]);
    const leftSubclavianMesh = new THREE.Mesh(
        new THREE.TubeGeometry(leftSubclavian, 25, 0.15, 12, false),
        arteryMaterial
    );
    leftSubclavianMesh.userData.type = 'artery';
    arterySystem.add(leftSubclavianMesh);
    
    // 右锁骨下动脉
    const rightSubclavian = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 7, 0.35),
        new THREE.Vector3(0.8, 7.1, 0.3),
        new THREE.Vector3(1.5, 7, 0.2),
        new THREE.Vector3(2.5, 6.5, 0.5)
    ]);
    const rightSubclavianMesh = new THREE.Mesh(
        new THREE.TubeGeometry(rightSubclavian, 25, 0.15, 12, false),
        arteryMaterial
    );
    rightSubclavianMesh.userData.type = 'artery';
    arterySystem.add(rightSubclavianMesh);

    // 左颈总动脉
    const leftCarotid = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 6.8, 0.35),     // 从主动脉弓分出
        new THREE.Vector3(-0.4, 7.2, 0.2),
        new THREE.Vector3(-0.6, 8, 0.1),
        new THREE.Vector3(-0.7, 9, 0)
    ]);
    const leftCarotidMesh = new THREE.Mesh(
        new THREE.TubeGeometry(leftCarotid, 25, 0.13, 10, false),
        arteryMaterial
    );
    leftCarotidMesh.userData.type = 'artery';
    arterySystem.add(leftCarotidMesh);
    
    // 右颈总动脉
    const rightCarotid = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 6.8, 0.35),
        new THREE.Vector3(0.4, 7.2, 0.2),
        new THREE.Vector3(0.6, 8, 0.1),
        new THREE.Vector3(0.7, 9, 0)
    ]);
    const rightCarotidMesh = new THREE.Mesh(
        new THREE.TubeGeometry(rightCarotid, 25, 0.13, 10, false),
        arteryMaterial
    );
    rightCarotidMesh.userData.type = 'artery';
    arterySystem.add(rightCarotidMesh);

    // 3. 降主动脉 - 从主动脉弓向下
    const descendingAorta = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 6, 0.4),        // 从主动脉弓继续
        new THREE.Vector3(-0.1, 4, 0),
        new THREE.Vector3(-0.2, 2, -0.2),
        new THREE.Vector3(-0.2, 0, -0.3),
        new THREE.Vector3(-0.1, -2, -0.4),
        new THREE.Vector3(0, -4, -0.4)
    ]);
    const descAorta = new THREE.Mesh(
        new THREE.TubeGeometry(descendingAorta, 60, 0.28, 14, false),
        arteryMaterial
    );
    descAorta.userData.type = 'artery';
    arterySystem.add(descAorta);

    // 4. 股动脉 - 从降主动脉分出
    const leftFemoral = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.1, -0.8, -0.3), // 从降主动脉分出
        new THREE.Vector3(-0.6, -1.2, -0.2),
        new THREE.Vector3(-0.9, -2, 0),
        new THREE.Vector3(-0.9, -3.5, 0)
    ]);
    const leftFemoralMesh = new THREE.Mesh(
        new THREE.TubeGeometry(leftFemoral, 25, 0.12, 10, false),
        arteryMaterial
    );
    leftFemoralMesh.userData.type = 'artery';
    arterySystem.add(leftFemoralMesh);
    
    const rightFemoral = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.8, -0.3),
        new THREE.Vector3(0.6, -1.2, -0.2),
        new THREE.Vector3(0.9, -2, 0),
        new THREE.Vector3(0.9, -3.5, 0)
    ]);
    const rightFemoralMesh = new THREE.Mesh(
        new THREE.TubeGeometry(rightFemoral, 25, 0.12, 10, false),
        arteryMaterial
    );
    rightFemoralMesh.userData.type = 'artery';
    arterySystem.add(rightFemoralMesh);

    // 5. 肺动脉 - 从心脏右侧出发
    const pulmonaryTrunk = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.4, 2.8, 0.3),    // 右心室出口
        new THREE.Vector3(0.5, 3.5, 0.2),
        new THREE.Vector3(0.4, 4.2, 0)
    ]);
    const pulmonaryTrunkMesh = new THREE.Mesh(
        new THREE.TubeGeometry(pulmonaryTrunk, 20, 0.22, 12, false),
        arteryMaterial
    );
    pulmonaryTrunkMesh.userData.type = 'artery';
    arterySystem.add(pulmonaryTrunkMesh);

    // 左肺动脉
    const leftPulmonary = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.4, 4.2, 0),      // 从肺动脉主干分出
        new THREE.Vector3(0, 4.5, -0.3),
        new THREE.Vector3(-0.8, 4.7, -0.6),
        new THREE.Vector3(-1.5, 4.8, -0.9),
        new THREE.Vector3(-2, 4.8, -1)       // 到达左肺
    ]);
    const leftPulmonaryMesh = new THREE.Mesh(
        new THREE.TubeGeometry(leftPulmonary, 30, 0.18, 10, false),
        arteryMaterial
    );
    leftPulmonaryMesh.userData.type = 'artery';
    arterySystem.add(leftPulmonaryMesh);

    // 右肺动脉
    const rightPulmonary = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.4, 4.2, 0),
        new THREE.Vector3(0.8, 4.5, -0.2),
        new THREE.Vector3(1.5, 4.7, -0.6),
        new THREE.Vector3(2.2, 4.8, -0.9),
        new THREE.Vector3(2.5, 4.8, -1)
    ]);
    const rightPulmonaryMesh = new THREE.Mesh(
        new THREE.TubeGeometry(rightPulmonary, 30, 0.18, 10, false),
        arteryMaterial
    );
    rightPulmonaryMesh.userData.type = 'artery';
    arterySystem.add(rightPulmonaryMesh);

    scene.add(arterySystem);

    // 添加动脉血流方向指示器（箭头标记）
    createArteryFlowDirectionIndicators();

    // ========== 静脉系统 - 从分支汇聚到心脏的完整结构 ==========
    veinSystem = new THREE.Group();
    veinSystem.userData.type = 'vein';

    const veinMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x3366ff,
        emissive: 0x4488ff,  // 增强蓝色发光边框
        emissiveIntensity: 0.9,  // 提高发光强度
        metalness: 0.05,
        roughness: 0.2,
        transparent: true,
        opacity: 0.12,  // 极低透明度，几乎透明，只保留蓝色边框
        clearcoat: 0.8,  // 增强边缘光泽
        clearcoatRoughness: 0.1,
        wireframe: false,
        side: THREE.DoubleSide
    });

    // 1. 股静脉 - 从腿部开始汇聚
    const leftFemoralVein = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.9, -3.5, 0.2),  // 腿部起始
        new THREE.Vector3(-0.9, -2, 0.3),
        new THREE.Vector3(-0.85, -0.8, 0.35)
    ]);
    const leftFemoralVeinMesh = new THREE.Mesh(
        new THREE.TubeGeometry(leftFemoralVein, 25, 0.13, 10, false),
        veinMaterial
    );
    leftFemoralVeinMesh.userData.type = 'vein';
    veinSystem.add(leftFemoralVeinMesh);
    
    const rightFemoralVein = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.9, -3.5, 0.2),
        new THREE.Vector3(0.9, -2, 0.3),
        new THREE.Vector3(0.85, -0.8, 0.35)
    ]);
    const rightFemoralVeinMesh = new THREE.Mesh(
        new THREE.TubeGeometry(rightFemoralVein, 25, 0.13, 10, false),
        veinMaterial
    );
    rightFemoralVeinMesh.userData.type = 'vein';
    veinSystem.add(rightFemoralVeinMesh);

    // 2. 下腔静脉 - 汇聚腿部和腹部血液到心脏
    const inferiorVenaCava = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -0.5, 0.4),     // 从股静脉汇合
        new THREE.Vector3(0.3, 0, 0.45),
        new THREE.Vector3(0.5, 1, 0.5),
        new THREE.Vector3(0.6, 2, 0.5),
        new THREE.Vector3(0.65, 3, 0.45),
        new THREE.Vector3(0.7, 3.8, 0.4)     // 到达右心房
    ]);
    const inferiorVenaCavaMesh = new THREE.Mesh(
        new THREE.TubeGeometry(inferiorVenaCava, 50, 0.3, 12, false),
        veinMaterial
    );
    inferiorVenaCavaMesh.userData.type = 'vein';
    veinSystem.add(inferiorVenaCavaMesh);

    // 3. 颈静脉 - 从头部回流
    const leftJugular = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.7, 9, 0.2),     // 头部起始
        new THREE.Vector3(-0.65, 8, 0.25),
        new THREE.Vector3(-0.6, 7.2, 0.3)
    ]);
    const leftJugularMesh = new THREE.Mesh(
        new THREE.TubeGeometry(leftJugular, 20, 0.12, 10, false),
        veinMaterial
    );
    leftJugularMesh.userData.type = 'vein';
    veinSystem.add(leftJugularMesh);
    
    const rightJugular = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.7, 9, 0.2),
        new THREE.Vector3(0.65, 8, 0.25),
        new THREE.Vector3(0.6, 7.2, 0.3)
    ]);
    const rightJugularMesh = new THREE.Mesh(
        new THREE.TubeGeometry(rightJugular, 20, 0.12, 10, false),
        veinMaterial
    );
    rightJugularMesh.userData.type = 'vein';
    veinSystem.add(rightJugularMesh);

    // 4. 锁骨下静脉 - 从上肢回流
    const leftSubclavianVein = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.5, 6.5, 0.6),   // 上肢起始
        new THREE.Vector3(-1.8, 6.8, 0.5),
        new THREE.Vector3(-1, 7, 0.4)
    ]);
    const leftSubclavianVeinMesh = new THREE.Mesh(
        new THREE.TubeGeometry(leftSubclavianVein, 20, 0.14, 10, false),
        veinMaterial
    );
    leftSubclavianVeinMesh.userData.type = 'vein';
    veinSystem.add(leftSubclavianVeinMesh);
    
    const rightSubclavianVein = new THREE.CatmullRomCurve3([
        new THREE.Vector3(2.5, 6.5, 0.6),
        new THREE.Vector3(1.8, 6.8, 0.5),
        new THREE.Vector3(1, 7, 0.4)
    ]);
    const rightSubclavianVeinMesh = new THREE.Mesh(
        new THREE.TubeGeometry(rightSubclavianVein, 20, 0.14, 10, false),
        veinMaterial
    );
    rightSubclavianVeinMesh.userData.type = 'vein';
    veinSystem.add(rightSubclavianVeinMesh);

    // 5. 头臂静脉 - 汇合颈静脉和锁骨下静脉
    const leftBrachiocephalic = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.8, 7.1, 0.35),  // 汇合点
        new THREE.Vector3(-0.5, 6.5, 0.4),
        new THREE.Vector3(-0.2, 5.5, 0.45)
    ]);
    const leftBrachiocephalicMesh = new THREE.Mesh(
        new THREE.TubeGeometry(leftBrachiocephalic, 20, 0.18, 10, false),
        veinMaterial
    );
    leftBrachiocephalicMesh.userData.type = 'vein';
    veinSystem.add(leftBrachiocephalicMesh);
    
    const rightBrachiocephalic = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.8, 7.1, 0.35),
        new THREE.Vector3(0.5, 6.5, 0.4),
        new THREE.Vector3(0.2, 5.5, 0.45)
    ]);
    const rightBrachiocephalicMesh = new THREE.Mesh(
        new THREE.TubeGeometry(rightBrachiocephalic, 20, 0.18, 10, false),
        veinMaterial
    );
    rightBrachiocephalicMesh.userData.type = 'vein';
    veinSystem.add(rightBrachiocephalicMesh);

    // 6. 上腔静脉 - 汇合头臂静脉到心脏
    const superiorVenaCava = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 5.2, 0.48),     // 汇合点
        new THREE.Vector3(0.2, 4.8, 0.45),
        new THREE.Vector3(0.4, 4.3, 0.4),
        new THREE.Vector3(0.6, 3.9, 0.38)    // 到达右心房
    ]);
    const superiorVenaCavaMesh = new THREE.Mesh(
        new THREE.TubeGeometry(superiorVenaCava, 30, 0.28, 12, false),
        veinMaterial
    );
    superiorVenaCavaMesh.userData.type = 'vein';
    veinSystem.add(superiorVenaCavaMesh);

    // 7. 肺静脉 - 从肺部到左心房 (4条)
    const pulmonaryVeinPaths = [
        // 左上肺静脉
        { start: [-2.2, 5, -1], mid: [-1.5, 4.5, -0.6], end: [-0.6, 4.1, -0.1] },
        // 左下肺静脉
        { start: [-2.2, 4, -1.1], mid: [-1.5, 3.8, -0.7], end: [-0.6, 3.7, -0.1] },
        // 右上肺静脉
        { start: [2.5, 5, -1], mid: [1.8, 4.5, -0.6], end: [0.6, 4.1, -0.1] },
        // 右下肺静脉
        { start: [2.5, 4, -1.1], mid: [1.8, 3.8, -0.7], end: [0.6, 3.7, -0.1] }
    ];

    pulmonaryVeinPaths.forEach((path, index) => {
        const veinCurve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(...path.start),
            new THREE.Vector3(...path.mid),
            new THREE.Vector3(...path.end)
        ]);
        const pulmonaryVeinMesh = new THREE.Mesh(
            new THREE.TubeGeometry(veinCurve, 25, 0.15, 10, false),
            veinMaterial
        );
        pulmonaryVeinMesh.userData.type = 'vein';
        pulmonaryVeinMesh.userData.name = `pulmonaryVein${index + 1}`;
        veinSystem.add(pulmonaryVeinMesh);
    });

    scene.add(veinSystem);
    
    // 添加静脉血流方向指示器（蓝色箭头）
    createVeinFlowDirectionIndicators();

    // ========== 毛细血管网络 - 连接动脉和静脉 ==========
    capillarySystem = new THREE.Group();
    capillarySystem.userData.type = 'capillary';

    const capillaryMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xcc77ff,  // 紫色
        emissive: 0x7733cc,
        emissiveIntensity: 0.7,
        metalness: 0.1,
        roughness: 0.3,
        transparent: true,
        opacity: 0.3,  // 降低透明度，从0.85降到0.3，可以看到内部红细胞
        shininess: 60,
        clearcoat: 0.3,
        side: THREE.DoubleSide
    });

    // 创建动脉-毛细血管-静脉连接网络（教学重点）
    createArteryCapillaryVeinConnections(capillarySystem, capillaryMaterial);

    scene.add(capillarySystem);
    
    // 添加心脏与血管的可视化连接点
    createHeartVesselConnections();
    
    // 创建血管结构对比展示（横切面和管壁）
    createVesselStructureComparison();
}

// 创建动脉-毛细血管-静脉连接网络（教学重点）
function createArteryCapillaryVeinConnections(capillaryGroup, capillaryMaterial) {
    // 大幅增加毛细血管网络，遍布全身各处
    const connectionNetworks = [
        // === 头部和颈部区域 ===
        {
            name: '大脑毛细血管网（前额叶）',
            arteryStart: [-0.3, 9.5, 0.8],
            capillaryCenter: [-0.5, 9.7, 0.9],
            veinEnd: [-0.4, 9.6, 1.0],
            count: 25,
            radius: 0.6
        },
        {
            name: '大脑毛细血管网（顶叶）',
            arteryStart: [0.3, 10, 0.5],
            capillaryCenter: [0.5, 10.2, 0.6],
            veinEnd: [0.4, 10.1, 0.7],
            count: 25,
            radius: 0.6
        },
        {
            name: '大脑毛细血管网（枕叶）',
            arteryStart: [0, 9.5, -0.5],
            capillaryCenter: [0, 9.7, -0.7],
            veinEnd: [0, 9.6, -0.6],
            count: 20,
            radius: 0.5
        },
        {
            name: '面部毛细血管网（左侧）',
            arteryStart: [-0.8, 8.5, 1.2],
            capillaryCenter: [-1.0, 8.7, 1.3],
            veinEnd: [-0.9, 8.6, 1.35],
            count: 18,
            radius: 0.5
        },
        {
            name: '面部毛细血管网（右侧）',
            arteryStart: [0.8, 8.5, 1.2],
            capillaryCenter: [1.0, 8.7, 1.3],
            veinEnd: [0.9, 8.6, 1.35],
            count: 18,
            radius: 0.5
        },
        {
            name: '颈部毛细血管网',
            arteryStart: [0, 8, 0.3],
            capillaryCenter: [0, 7.8, 0.4],
            veinEnd: [0, 7.9, 0.5],
            count: 15,
            radius: 0.6
        },
        
        // === 胸部区域 ===
        {
            name: '左肺上叶毛细血管网',
            arteryStart: [-2, 5.5, -1],
            capillaryCenter: [-2.1, 5.3, -1.1],
            veinEnd: [-2.2, 5.4, -1],
            count: 30,
            radius: 0.9
        },
        {
            name: '左肺中部毛细血管网',
            arteryStart: [-2, 4.8, -1],
            capillaryCenter: [-2, 4.3, -1.1],
            veinEnd: [-2.2, 4.5, -1],
            count: 28,
            radius: 0.8
        },
        {
            name: '左肺下叶毛细血管网',
            arteryStart: [-2, 3.8, -1],
            capillaryCenter: [-2.1, 3.5, -1.1],
            veinEnd: [-2.2, 3.6, -1],
            count: 28,
            radius: 0.8
        },
        {
            name: '右肺上叶毛细血管网',
            arteryStart: [2.5, 5.8, -1],
            capillaryCenter: [2.4, 5.5, -1.1],
            veinEnd: [2.5, 5.6, -1],
            count: 30,
            radius: 0.9
        },
        {
            name: '右肺中叶毛细血管网',
            arteryStart: [2.5, 4.8, -1],
            capillaryCenter: [2.3, 4.3, -1.1],
            veinEnd: [2.5, 4.5, -1],
            count: 25,
            radius: 0.8
        },
        {
            name: '右肺下叶毛细血管网',
            arteryStart: [2.5, 3.5, -1],
            capillaryCenter: [2.4, 3.2, -1.1],
            veinEnd: [2.5, 3.3, -1],
            count: 28,
            radius: 0.9
        },
        {
            name: '胸壁毛细血管网（左侧）',
            arteryStart: [-1.5, 5, 1],
            capillaryCenter: [-1.7, 4.8, 1.1],
            veinEnd: [-1.6, 4.9, 1.15],
            count: 15,
            radius: 0.5
        },
        {
            name: '胸壁毛细血管网（右侧）',
            arteryStart: [1.5, 5, 1],
            capillaryCenter: [1.7, 4.8, 1.1],
            veinEnd: [1.6, 4.9, 1.15],
            count: 15,
            radius: 0.5
        },
        
        // === 腹部区域 ===
        {
            name: '肝脏右叶毛细血管网',
            arteryStart: [1.8, 0.5, -1.2],
            capillaryCenter: [1.7, 0.2, -1.5],
            veinEnd: [1.9, 0.3, -1.3],
            count: 35,
            radius: 1.0
        },
        {
            name: '肝脏左叶毛细血管网',
            arteryStart: [0.8, 0.5, -1.2],
            capillaryCenter: [0.9, 0.1, -1.4],
            veinEnd: [1.0, 0.2, -1.3],
            count: 25,
            radius: 0.8
        },
        {
            name: '肝脏中央毛细血管网',
            arteryStart: [1.3, 0.3, -1.3],
            capillaryCenter: [1.4, 0, -1.5],
            veinEnd: [1.5, 0.1, -1.4],
            count: 30,
            radius: 0.9
        },
        {
            name: '胃底部毛细血管网',
            arteryStart: [-1.8, 1.2, -0.4],
            capillaryCenter: [-1.9, 1.0, -0.5],
            veinEnd: [-2.0, 1.1, -0.55],
            count: 20,
            radius: 0.6
        },
        {
            name: '胃体毛细血管网',
            arteryStart: [-1.2, 0.8, -0.4],
            capillaryCenter: [-1.5, 0.5, -0.5],
            veinEnd: [-1.7, 0.6, -0.6],
            count: 22,
            radius: 0.7
        },
        {
            name: '胃幽门部毛细血管网',
            arteryStart: [-0.8, 0.3, -0.3],
            capillaryCenter: [-1.0, 0.1, -0.4],
            veinEnd: [-1.1, 0.2, -0.5],
            count: 18,
            radius: 0.5
        },
        {
            name: '肠系膜毛细血管网（上部）',
            arteryStart: [0, -0.5, -1.0],
            capillaryCenter: [0.2, -0.8, -1.2],
            veinEnd: [0.1, -0.7, -1.15],
            count: 25,
            radius: 0.7
        },
        {
            name: '肠系膜毛细血管网（下部）',
            arteryStart: [0, -1.5, -1.1],
            capillaryCenter: [0.3, -1.8, -1.3],
            veinEnd: [0.2, -1.7, -1.25],
            count: 25,
            radius: 0.7
        },
        {
            name: '脾脏毛细血管网',
            arteryStart: [-2.5, 0.5, -1.0],
            capillaryCenter: [-2.7, 0.3, -1.1],
            veinEnd: [-2.6, 0.4, -1.15],
            count: 20,
            radius: 0.6
        },
        {
            name: '肾脏毛细血管网（左）',
            arteryStart: [-1.2, -0.5, -1.5],
            capillaryCenter: [-1.4, -0.7, -1.6],
            veinEnd: [-1.3, -0.6, -1.65],
            count: 22,
            radius: 0.6
        },
        {
            name: '肾脏毛细血管网（右）',
            arteryStart: [1.2, -0.5, -1.5],
            capillaryCenter: [1.4, -0.7, -1.6],
            veinEnd: [1.3, -0.6, -1.65],
            count: 22,
            radius: 0.6
        },
        {
            name: '腹壁毛细血管网',
            arteryStart: [0, 0, 1.5],
            capillaryCenter: [0, -0.2, 1.6],
            veinEnd: [0, -0.1, 1.65],
            count: 18,
            radius: 0.8
        },
        
        // === 上肢区域 ===
        {
            name: '左肩部毛细血管网',
            arteryStart: [-2.8, 6.5, 0.5],
            capillaryCenter: [-3.0, 6.3, 0.6],
            veinEnd: [-2.9, 6.4, 0.65],
            count: 15,
            radius: 0.5
        },
        {
            name: '左上臂毛细血管网',
            arteryStart: [-2.8, 5, 0.5],
            capillaryCenter: [-3.1, 4.8, 0.7],
            veinEnd: [-3.0, 4.9, 0.75],
            count: 18,
            radius: 0.6
        },
        {
            name: '左前臂毛细血管网',
            arteryStart: [-2.8, 3, 0.4],
            capillaryCenter: [-3.0, 2.8, 0.6],
            veinEnd: [-2.9, 2.9, 0.65],
            count: 16,
            radius: 0.5
        },
        {
            name: '左手掌毛细血管网',
            arteryStart: [-2.8, 1, 0.3],
            capillaryCenter: [-3.0, 0.8, 0.5],
            veinEnd: [-2.9, 0.9, 0.55],
            count: 20,
            radius: 0.4
        },
        {
            name: '右肩部毛细血管网',
            arteryStart: [2.8, 6.5, 0.5],
            capillaryCenter: [3.0, 6.3, 0.6],
            veinEnd: [2.9, 6.4, 0.65],
            count: 15,
            radius: 0.5
        },
        {
            name: '右上臂毛细血管网',
            arteryStart: [2.8, 5, 0.5],
            capillaryCenter: [3.1, 4.8, 0.7],
            veinEnd: [3.0, 4.9, 0.75],
            count: 18,
            radius: 0.6
        },
        {
            name: '右前臂毛细血管网',
            arteryStart: [2.8, 3, 0.4],
            capillaryCenter: [3.0, 2.8, 0.6],
            veinEnd: [2.9, 2.9, 0.65],
            count: 16,
            radius: 0.5
        },
        {
            name: '右手掌毛细血管网',
            arteryStart: [2.8, 1, 0.3],
            capillaryCenter: [3.0, 0.8, 0.5],
            veinEnd: [2.9, 0.9, 0.55],
            count: 20,
            radius: 0.4
        },
        
        // === 下肢区域 ===
        {
            name: '左大腿上部毛细血管网',
            arteryStart: [-0.9, -1.5, 0],
            capillaryCenter: [-1.2, -1.8, 0.2],
            veinEnd: [-1.1, -1.7, 0.25],
            count: 20,
            radius: 0.7
        },
        {
            name: '左大腿中部毛细血管网',
            arteryStart: [-0.9, -2.5, 0],
            capillaryCenter: [-1.2, -2.8, 0.2],
            veinEnd: [-1.1, -2.7, 0.25],
            count: 18,
            radius: 0.6
        },
        {
            name: '左膝部毛细血管网',
            arteryStart: [-0.9, -4, 0],
            capillaryCenter: [-1.1, -4.2, 0.2],
            veinEnd: [-1.0, -4.1, 0.25],
            count: 15,
            radius: 0.5
        },
        {
            name: '左小腿毛细血管网',
            arteryStart: [-0.9, -5.5, 0],
            capillaryCenter: [-1.2, -5.8, 0.2],
            veinEnd: [-1.1, -5.7, 0.25],
            count: 18,
            radius: 0.6
        },
        {
            name: '左脚掌毛细血管网',
            arteryStart: [-0.9, -7.2, 0.5],
            capillaryCenter: [-1.1, -7.4, 0.7],
            veinEnd: [-1.0, -7.3, 0.75],
            count: 20,
            radius: 0.5
        },
        {
            name: '右大腿上部毛细血管网',
            arteryStart: [0.9, -1.5, 0],
            capillaryCenter: [1.2, -1.8, 0.2],
            veinEnd: [1.1, -1.7, 0.25],
            count: 20,
            radius: 0.7
        },
        {
            name: '右大腿中部毛细血管网',
            arteryStart: [0.9, -2.5, 0],
            capillaryCenter: [1.2, -2.8, 0.2],
            veinEnd: [1.1, -2.7, 0.25],
            count: 18,
            radius: 0.6
        },
        {
            name: '右膝部毛细血管网',
            arteryStart: [0.9, -4, 0],
            capillaryCenter: [1.1, -4.2, 0.2],
            veinEnd: [1.0, -4.1, 0.25],
            count: 15,
            radius: 0.5
        },
        {
            name: '右小腿毛细血管网',
            arteryStart: [0.9, -5.5, 0],
            capillaryCenter: [1.2, -5.8, 0.2],
            veinEnd: [1.1, -5.7, 0.25],
            count: 18,
            radius: 0.6
        },
        {
            name: '右脚掌毛细血管网',
            arteryStart: [0.9, -7.2, 0.5],
            capillaryCenter: [1.1, -7.4, 0.7],
            veinEnd: [1.0, -7.3, 0.75],
            count: 20,
            radius: 0.5
        },
        
        // === 躯干其他部位 ===
        {
            name: '心脏周围毛细血管网',
            arteryStart: [0, 3.2, 0.8],
            capillaryCenter: [0, 3, 1.0],
            veinEnd: [0, 3.1, 1.1],
            count: 12,
            radius: 0.5
        },
        {
            name: '背部上段毛细血管网',
            arteryStart: [0, 5, -1.5],
            capillaryCenter: [0, 4.8, -1.7],
            veinEnd: [0, 4.9, -1.8],
            count: 20,
            radius: 0.8
        },
        {
            name: '背部中段毛细血管网',
            arteryStart: [0, 2, -1.5],
            capillaryCenter: [0, 1.8, -1.7],
            veinEnd: [0, 1.9, -1.8],
            count: 20,
            radius: 0.8
        },
        {
            name: '背部下段毛细血管网',
            arteryStart: [0, -1, -1.5],
            capillaryCenter: [0, -1.2, -1.7],
            veinEnd: [0, -1.1, -1.8],
            count: 18,
            radius: 0.7
        },
        {
            name: '骨盆区域毛细血管网',
            arteryStart: [0, -1.5, -0.3],
            capillaryCenter: [0, -1.7, -0.5],
            veinEnd: [0, -1.6, -0.6],
            count: 16,
            radius: 0.6
        }
    ];

    // 为每个器官创建完整的血管连接网络
    connectionNetworks.forEach(network => {
        const arteryPos = new THREE.Vector3(...network.arteryStart);
        const capillaryPos = new THREE.Vector3(...network.capillaryCenter);
        const veinPos = new THREE.Vector3(...network.veinEnd);

        // 创建放射状毛细血管网络
        for (let i = 0; i < network.count; i++) {
            const angle = (i / network.count) * Math.PI * 2;
            const radiusVar = network.radius * (0.6 + Math.random() * 0.4);
            
            // 中间点（毛细血管网中心）
            const midPoint = new THREE.Vector3(
                capillaryPos.x + Math.cos(angle) * radiusVar * 0.5,
                capillaryPos.y + (Math.random() - 0.5) * 0.3,
                capillaryPos.z + Math.sin(angle) * radiusVar * 0.5
            );

            // 第一段：动脉末端 → 毛细血管网（红色渐变到紫色）
            const arteryToCapillary = new THREE.CatmullRomCurve3([
                arteryPos,
                new THREE.Vector3(
                    (arteryPos.x + midPoint.x) / 2,
                    (arteryPos.y + midPoint.y) / 2,
                    (arteryPos.z + midPoint.z) / 2
                ),
                midPoint
            ]);
            
            // 渐变材质（红→紫）
            const transitionMat1 = new THREE.MeshPhysicalMaterial({
                color: 0xff5588,  // 红紫过渡色
                emissive: 0xcc3366,
                emissiveIntensity: 0.6,
                metalness: 0.1,
                roughness: 0.3,
                transparent: true,
                opacity: 0.85
            });
            
            const arteryCapillaryMesh = new THREE.Mesh(
                new THREE.TubeGeometry(arteryToCapillary, 15, 0.025, 6, false),
                transitionMat1
            );
            arteryCapillaryMesh.userData.type = 'capillary';
            arteryCapillaryMesh.userData.connection = 'artery-to-capillary';
            capillaryGroup.add(arteryCapillaryMesh);

            // 第二段：毛细血管网内部（紫色，极细）
            const capillaryLoop = new THREE.CatmullRomCurve3([
                midPoint,
                new THREE.Vector3(
                    midPoint.x + Math.cos(angle + 0.3) * radiusVar * 0.3,
                    midPoint.y + (Math.random() - 0.5) * 0.2,
                    midPoint.z + Math.sin(angle + 0.3) * radiusVar * 0.3
                ),
                new THREE.Vector3(
                    capillaryPos.x + Math.cos(angle + 0.6) * radiusVar * 0.6,
                    capillaryPos.y + (Math.random() - 0.5) * 0.25,
                    capillaryPos.z + Math.sin(angle + 0.6) * radiusVar * 0.6
                )
            ]);
            
            const capillaryMesh = new THREE.Mesh(
                new THREE.TubeGeometry(capillaryLoop, 12, 0.015, 4, false),  // 极细
                capillaryMaterial
            );
            capillaryMesh.userData.type = 'capillary';
            capillaryMesh.userData.connection = 'capillary-network';
            capillaryGroup.add(capillaryMesh);

            // 第三段：毛细血管网 → 静脉起始（紫色渐变到蓝色）
            const endPoint = new THREE.Vector3(
                capillaryPos.x + Math.cos(angle + 0.6) * radiusVar * 0.6,
                capillaryPos.y + (Math.random() - 0.5) * 0.25,
                capillaryPos.z + Math.sin(angle + 0.6) * radiusVar * 0.6
            );

            const capillaryToVein = new THREE.CatmullRomCurve3([
                endPoint,
                new THREE.Vector3(
                    (endPoint.x + veinPos.x) / 2,
                    (endPoint.y + veinPos.y) / 2,
                    (endPoint.z + veinPos.z) / 2
                ),
                veinPos
            ]);
            
            // 渐变材质（紫→蓝）
            const transitionMat2 = new THREE.MeshPhysicalMaterial({
                color: 0x7766ff,  // 紫蓝过渡色
                emissive: 0x4433aa,
                emissiveIntensity: 0.6,
                metalness: 0.1,
                roughness: 0.3,
                transparent: true,
                opacity: 0.85
            });
            
            const capillaryVeinMesh = new THREE.Mesh(
                new THREE.TubeGeometry(capillaryToVein, 15, 0.025, 6, false),
                transitionMat2
            );
            capillaryVeinMesh.userData.type = 'capillary';
            capillaryVeinMesh.userData.connection = 'capillary-to-vein';
            capillaryGroup.add(capillaryVeinMesh);
        }

        // 添加连接点标记球（教学辅助）
        const markerMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00,
            transparent: true,
            opacity: 0.6
        });
        
        const arteryMarker = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 8),
            markerMaterial.clone()
        );
        arteryMarker.material.color.setHex(0xff3333);
        arteryMarker.position.copy(arteryPos);
        arteryMarker.userData.label = network.name + ' - 动脉入口';
        capillaryGroup.add(arteryMarker);

        const veinMarker = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 8),
            markerMaterial.clone()
        );
        veinMarker.material.color.setHex(0x3366ff);
        veinMarker.position.copy(veinPos);
        veinMarker.userData.label = network.name + ' - 静脉出口';
        capillaryGroup.add(veinMarker);
    });
}

// 创建血管结构对比展示（横切面和管壁）
function createVesselStructureComparison() {
    const comparisonGroup = new THREE.Group();
    comparisonGroup.userData.type = 'vesselComparison';
    comparisonGroup.position.set(8, 5, 0);  // 放置在右侧

    // 标题板
    const titleGeo = new THREE.PlaneGeometry(4, 0.5);
    const titleMat = new THREE.MeshBasicMaterial({
        color: 0x222244,
        transparent: true,
        opacity: 0.8
    });
    const titlePlane = new THREE.Mesh(titleGeo, titleMat);
    titlePlane.position.y = 3;
    comparisonGroup.add(titlePlane);

    // 三种血管的横切面对比
    const yPositions = [2, 0.5, -1];  // 三个血管的Y位置
    const vesselData = [
        {
            name: '动脉横切面',
            color: 0xff3333,
            outerRadius: 0.5,      // 外径
            innerRadius: 0.25,     // 内径（管腔）
            wallThickness: 0.25,   // 管壁厚
            elasticity: 'high',
            emissive: 0xaa0000,
            label: '动脉：管壁厚，弹性强'
        },
        {
            name: '静脉横切面',
            color: 0x3366ff,
            outerRadius: 0.6,      // 外径（静脉管腔大）
            innerRadius: 0.45,     // 内径
            wallThickness: 0.15,   // 管壁薄
            elasticity: 'medium',
            emissive: 0x1a3a7e,
            label: '静脉：管壁薄，管腔大'
        },
        {
            name: '毛细血管横切面',
            color: 0xcc77ff,
            outerRadius: 0.12,     // 极小
            innerRadius: 0.08,     // 仅容单个红细胞
            wallThickness: 0.04,   // 极薄（单层细胞）
            elasticity: 'none',
            emissive: 0x7733cc,
            label: '毛细血管：极细，单层细胞'
        }
    ];

    vesselData.forEach((vessel, index) => {
        const yPos = yPositions[index];

        // 1. 血管横切面（圆环）
        const crossSectionGeo = new THREE.RingGeometry(
            vessel.innerRadius,
            vessel.outerRadius,
            32
        );
        const crossSectionMat = new THREE.MeshPhysicalMaterial({
            color: vessel.color,
            emissive: vessel.emissive,
            emissiveIntensity: 0.5,
            metalness: 0.2,
            roughness: 0.4,
            transparent: true,
            opacity: 0.9,
            side: THREE.DoubleSide
        });
        const crossSection = new THREE.Mesh(crossSectionGeo, crossSectionMat);
        crossSection.position.set(0, yPos, 0);
        crossSection.userData.type = 'vesselComparison';
        comparisonGroup.add(crossSection);

        // 2. 管壁结构层次（多层圆环表示不同层）
        const layers = vessel.name === '动脉横切面' ? 3 : (vessel.name === '静脉横切面' ? 2 : 1);
        for (let i = 0; i < layers; i++) {
            const layerRadius = vessel.innerRadius + (vessel.wallThickness / layers) * i;
            const layerThickness = vessel.wallThickness / layers;
            
            const layerGeo = new THREE.RingGeometry(
                layerRadius,
                layerRadius + layerThickness * 0.8,
                32
            );
            const layerMat = new THREE.MeshBasicMaterial({
                color: vessel.color,
                transparent: true,
                opacity: 0.3 + i * 0.2,
                side: THREE.DoubleSide
            });
            const layer = new THREE.Mesh(layerGeo, layerMat);
            layer.position.set(1.5, yPos, 0);
            layer.rotation.y = i * 0.3;  // 轻微旋转区分层次
            comparisonGroup.add(layer);
        }

        // 3. 3D管道模型（显示弹性）
        const tubeGeo = new THREE.CylinderGeometry(
            vessel.outerRadius,
            vessel.outerRadius,
            1.5,
            32
        );
        const tubeMat = new THREE.MeshPhysicalMaterial({
            color: vessel.color,
            emissive: vessel.emissive,
            emissiveIntensity: 0.4,
            metalness: 0.1,
            roughness: 0.5,
            transparent: true,
            opacity: 0.7,
            clearcoat: 0.5
        });
        const tube3D = new THREE.Mesh(tubeGeo, tubeMat);
        tube3D.position.set(-1.5, yPos, 0);
        tube3D.rotation.z = Math.PI / 2;
        tube3D.userData.elasticity = vessel.elasticity;
        tube3D.userData.type = 'vesselComparison';
        
        // 弹性动画
        tube3D.userData.animate = (time) => {
            if (vessel.elasticity === 'high') {
                // 动脉：强弹性搏动
                const pulse = Math.sin(time * 3) * 0.15 + 1;
                tube3D.scale.set(pulse, 1, pulse);
            } else if (vessel.elasticity === 'medium') {
                // 静脉：轻微搏动
                const pulse = Math.sin(time * 2) * 0.05 + 1;
                tube3D.scale.set(pulse, 1, pulse);
            }
            // 毛细血管：无搏动
        };
        
        comparisonGroup.add(tube3D);

        // 4. 内腔（管腔）
        const lumenGeo = new THREE.CylinderGeometry(
            vessel.innerRadius,
            vessel.innerRadius,
            1.5,
            32
        );
        const lumenMat = new THREE.MeshBasicMaterial({
            color: vessel.color,
            transparent: true,
            opacity: 0.3
        });
        const lumen = new THREE.Mesh(lumenGeo, lumenMat);
        lumen.position.set(-1.5, yPos, 0);
        lumen.rotation.z = Math.PI / 2;
        comparisonGroup.add(lumen);

        // 5. 标签文字（使用简单的几何体表示）
        const labelGeo = new THREE.PlaneGeometry(2, 0.3);
        const labelMat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.8
        });
        const labelPlane = new THREE.Mesh(labelGeo, labelMat);
        labelPlane.position.set(0, yPos - 0.8, 0.1);
        comparisonGroup.add(labelPlane);
    });

    scene.add(comparisonGroup);
}

// 创建动脉血流方向指示器
function createArteryFlowDirectionIndicators() {
    const arrowGroup = new THREE.Group();
    arrowGroup.userData.type = 'flowIndicators';

    // 箭头材质（红色发光）
    const arrowMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xff0000,
        emissive: 0xff3333,
        emissiveIntensity: 1.2,
        metalness: 0.3,
        roughness: 0.2,
        transparent: true,
        opacity: 0.9
    });

    // 定义关键血流路径上的箭头位置和方向
    const arrowPositions = [
        // 主动脉路径（从心脏向上）
        { pos: [0, 3.5, 0.3], dir: [0, 1, 0], label: '从左心室' },
        { pos: [0, 5, 0.4], dir: [0, 1, 0], label: '升主动脉' },
        { pos: [0, 6.5, 0.4], dir: [0, 1, 0], label: '主动脉弓' },
        
        // 左锁骨下动脉（向左臂）
        { pos: [-0.8, 7.1, 0.3], dir: [-1, 0, 0], label: '→左臂' },
        { pos: [-2, 6.8, 0.4], dir: [-1, 0, 0], label: '→左臂' },
        
        // 右锁骨下动脉（向右臂）
        { pos: [0.8, 7.1, 0.3], dir: [1, 0, 0], label: '→右臂' },
        { pos: [2, 6.8, 0.4], dir: [1, 0, 0], label: '→右臂' },
        
        // 左颈动脉（向头部）
        { pos: [-0.5, 7.5, 0.25], dir: [0, 1, 0], label: '→头部' },
        { pos: [-0.65, 8.5, 0.15], dir: [0, 1, 0], label: '→头部' },
        
        // 右颈动脉（向头部）
        { pos: [0.5, 7.5, 0.25], dir: [0, 1, 0], label: '→头部' },
        { pos: [0.65, 8.5, 0.15], dir: [0, 1, 0], label: '→头部' },
        
        // 降主动脉（向下）
        { pos: [-0.1, 3, 0], dir: [0, -1, 0], label: '降主动脉' },
        { pos: [-0.15, 1, -0.1], dir: [0, -1, 0], label: '向下' },
        { pos: [-0.1, -1, -0.3], dir: [0, -1, 0], label: '向下' },
        { pos: [0, -3, -0.4], dir: [0, -1, 0], label: '向腿部' },
        
        // 左股动脉（向左腿）
        { pos: [-0.7, -1.5, -0.1], dir: [0, -1, 0], label: '→左腿' },
        { pos: [-0.9, -2.7, 0], dir: [0, -1, 0], label: '→左腿' },
        
        // 右股动脉（向右腿）
        { pos: [0.7, -1.5, -0.1], dir: [0, -1, 0], label: '→右腿' },
        { pos: [0.9, -2.7, 0], dir: [0, -1, 0], label: '→右腿' },
        
        // 肺动脉（从右心室到肺）
        { pos: [0.45, 3.2, 0.25], dir: [0, 1, 0], label: '从右心室' },
        { pos: [0.4, 3.8, 0.1], dir: [0, 1, 0], label: '肺动脉主干' },
        
        // 左肺动脉
        { pos: [-0.5, 4.4, -0.4], dir: [-1, 0, -1], label: '→左肺' },
        { pos: [-1.5, 4.75, -0.85], dir: [-1, 0, -1], label: '→左肺' },
        
        // 右肺动脉
        { pos: [1, 4.5, -0.5], dir: [1, 0, -1], label: '→右肺' },
        { pos: [1.8, 4.75, -0.85], dir: [1, 0, -1], label: '→右肺' }
    ];

    arrowPositions.forEach((arrowData, index) => {
        // 创建3D箭头（锥体 + 圆柱）
        const arrowLength = 0.4;
        const arrowWidth = 0.08;
        
        // 箭头主体（圆柱）
        const shaftGeo = new THREE.CylinderGeometry(
            arrowWidth * 0.5,
            arrowWidth * 0.5,
            arrowLength * 0.6,
            8
        );
        const shaft = new THREE.Mesh(shaftGeo, arrowMaterial.clone());
        
        // 箭头头部（锥体）
        const headGeo = new THREE.ConeGeometry(
            arrowWidth * 1.2,
            arrowLength * 0.4,
            8
        );
        const head = new THREE.Mesh(headGeo, arrowMaterial.clone());
        head.position.y = arrowLength * 0.5;
        
        // 组合箭头
        const arrow = new THREE.Group();
        arrow.add(shaft);
        arrow.add(head);
        
        // 设置位置
        arrow.position.set(...arrowData.pos);
        
        // 设置方向
        const direction = new THREE.Vector3(...arrowData.dir).normalize();
        const up = new THREE.Vector3(0, 1, 0);
        
        // 旋转箭头指向血流方向
        if (Math.abs(direction.dot(up)) < 0.99) {
            arrow.quaternion.setFromUnitVectors(up, direction);
        } else if (direction.y < 0) {
            arrow.rotation.z = Math.PI;
        }
        
        // 添加动画数据
        arrow.userData.basePosition = arrow.position.clone();
        arrow.userData.direction = direction;
        arrow.userData.phase = index * 0.3; // 错开相位
        arrow.userData.type = 'flowArrow';
        arrow.userData.label = arrowData.label;
        
        arrowGroup.add(arrow);
    });

    // 添加流动动画
    arrowGroup.userData.animate = (time) => {
        arrowGroup.children.forEach(arrow => {
            if (arrow.userData.type === 'flowArrow') {
                // 脉动发光效果
                const pulse = Math.sin(time * 3 + arrow.userData.phase) * 0.5 + 0.5;
                arrow.children.forEach(mesh => {
                    if (mesh.material) {
                        mesh.material.emissiveIntensity = 0.8 + pulse * 0.6;
                        mesh.material.opacity = 0.7 + pulse * 0.3;
                    }
                });
                
                // 沿血流方向移动（来回运动）
                const movement = Math.sin(time * 2 + arrow.userData.phase) * 0.15;
                const offset = arrow.userData.direction.clone().multiplyScalar(movement);
                arrow.position.copy(arrow.userData.basePosition).add(offset);
                
                // 轻微缩放
                const scale = 1 + pulse * 0.2;
                arrow.scale.setScalar(scale);
            }
        });
    };

    scene.add(arrowGroup);
    window.flowArrowGroup = arrowGroup;
}

// 创建静脉血流方向指示器（蓝色箭头，指向心脏）
function createVeinFlowDirectionIndicators() {
    const arrowGroup = new THREE.Group();
    arrowGroup.userData.type = 'veinFlowIndicators';

    const arrowMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x3366ff,
        emissive: 0x4477ff,
        emissiveIntensity: 1.2,
        metalness: 0.3,
        roughness: 0.2,
        transparent: true,
        opacity: 0.85
    });

    const veinArrowPositions = [
        { pos: [-0.9, -3, 0.25], dir: [0, 1, 0], label: '回心脏' },
        { pos: [-0.88, -1.5, 0.32], dir: [0, 1, 0], label: '↑' },
        { pos: [0.9, -3, 0.25], dir: [0, 1, 0], label: '回心脏' },
        { pos: [0.88, -1.5, 0.32], dir: [0, 1, 0], label: '↑' },
        { pos: [0.4, 0.5, 0.45], dir: [0, 1, 0], label: '下腔静脉' },
        { pos: [0.55, 2, 0.48], dir: [0, 1, 0], label: '↑右心房' },
        { pos: [0.65, 3.3, 0.42], dir: [0, 1, 0], label: '↑右心房' },
        { pos: [-0.68, 8.5, 0.27], dir: [0, -1, 0], label: '回心脏' },
        { pos: [-0.62, 7.6, 0.32], dir: [0, -1, 0], label: '↓' },
        { pos: [0.68, 8.5, 0.27], dir: [0, -1, 0], label: '回心脏' },
        { pos: [0.62, 7.6, 0.32], dir: [0, -1, 0], label: '↓' },
        { pos: [0.3, 5, 0.46], dir: [0, -1, 0], label: '上腔静脉' },
        { pos: [0.5, 4.4, 0.43], dir: [0, -1, 0], label: '↓右心房' },
        { pos: [-1.8, 4.6, -0.75], dir: [1, 0, 1], label: '→左心房' },
        { pos: [-1.2, 4.2, -0.45], dir: [1, 0, 1], label: '→左心房' },
        { pos: [1.8, 4.6, -0.75], dir: [-1, 0, 1], label: '→左心房' },
        { pos: [1.2, 4.2, -0.45], dir: [-1, 0, 1], label: '→左心房' }
    ];

    veinArrowPositions.forEach((arrowData, index) => {
        const arrowLength = 0.35;
        const arrowWidth = 0.07;
        const shaftGeo = new THREE.CylinderGeometry(arrowWidth * 0.5, arrowWidth * 0.5, arrowLength * 0.6, 8);
        const shaft = new THREE.Mesh(shaftGeo, arrowMaterial.clone());
        const headGeo = new THREE.ConeGeometry(arrowWidth * 1.2, arrowLength * 0.4, 8);
        const head = new THREE.Mesh(headGeo, arrowMaterial.clone());
        head.position.y = arrowLength * 0.5;
        const arrow = new THREE.Group();
        arrow.add(shaft);
        arrow.add(head);
        arrow.position.set(...arrowData.pos);
        const direction = new THREE.Vector3(...arrowData.dir).normalize();
        const up = new THREE.Vector3(0, 1, 0);
        if (Math.abs(direction.dot(up)) < 0.99) {
            arrow.quaternion.setFromUnitVectors(up, direction);
        } else if (direction.y < 0) {
            arrow.rotation.z = Math.PI;
        }
        arrow.userData.basePosition = arrow.position.clone();
        arrow.userData.direction = direction;
        arrow.userData.phase = index * 0.4;
        arrow.userData.type = 'veinFlowArrow';
        arrow.userData.label = arrowData.label;
        arrowGroup.add(arrow);
    });

    arrowGroup.userData.animate = (time) => {
        arrowGroup.children.forEach(arrow => {
            if (arrow.userData.type === 'veinFlowArrow') {
                const pulse = Math.sin(time * 2.5 + arrow.userData.phase) * 0.5 + 0.5;
                arrow.children.forEach(mesh => {
                    if (mesh.material) {
                        mesh.material.emissiveIntensity = 0.7 + pulse * 0.5;
                        mesh.material.opacity = 0.65 + pulse * 0.25;
                    }
                });
                const movement = Math.sin(time * 1.8 + arrow.userData.phase) * 0.12;
                const offset = arrow.userData.direction.clone().multiplyScalar(movement);
                arrow.position.copy(arrow.userData.basePosition).add(offset);
                const scale = 1 + pulse * 0.15;
                arrow.scale.setScalar(scale);
            }
        });
    };

    scene.add(arrowGroup);
    window.veinFlowArrowGroup = arrowGroup;
}

// 创建心脏与血管的连接点可视化
function createHeartVesselConnections() {
    // 主动脉出口 - 红色发光球
    const aortaConnection = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        new THREE.MeshBasicMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.8
        })
    );
    aortaConnection.position.set(-0.2, 3.5, 0.5);
    scene.add(aortaConnection);
    
    // 动画效果
    aortaConnection.userData.animate = (time) => {
        const pulse = Math.sin(time * 3) * 0.5 + 0.5;
        aortaConnection.scale.setScalar(1 + pulse * 0.3);
        aortaConnection.material.opacity = 0.6 + pulse * 0.4;
    };
    
    // 肺动脉出口 - 红色发光球
    const pulmonaryArteryConnection = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 16, 16),
        new THREE.MeshBasicMaterial({
            color: 0xff3333,
            transparent: true,
            opacity: 0.8
        })
    );
    pulmonaryArteryConnection.position.set(0.5, 3.5, 0.3);
    scene.add(pulmonaryArteryConnection);
    
    pulmonaryArteryConnection.userData.animate = (time) => {
        const pulse = Math.sin(time * 3 + 0.5) * 0.5 + 0.5;
        pulmonaryArteryConnection.scale.setScalar(1 + pulse * 0.3);
        pulmonaryArteryConnection.material.opacity = 0.6 + pulse * 0.4;
    };
    
    // 上腔静脉入口 - 蓝色发光球
    const superiorVenaConnection = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 16, 16),
        new THREE.MeshBasicMaterial({
            color: 0x3366ff,
            transparent: true,
            opacity: 0.8
        })
    );
    superiorVenaConnection.position.set(0.6, 4, 0.3);
    scene.add(superiorVenaConnection);
    
    superiorVenaConnection.userData.animate = (time) => {
        const pulse = Math.sin(time * 2.8) * 0.5 + 0.5;
        superiorVenaConnection.scale.setScalar(1 + pulse * 0.25);
        superiorVenaConnection.material.opacity = 0.6 + pulse * 0.3;
    };
    
    // 下腔静脉入口 - 蓝色发光球
    const inferiorVenaConnection = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 16, 16),
        new THREE.MeshBasicMaterial({
            color: 0x3366ff,
            transparent: true,
            opacity: 0.8
        })
    );
    inferiorVenaConnection.position.set(0.7, 1.5, 0.5);
    scene.add(inferiorVenaConnection);
    
    inferiorVenaConnection.userData.animate = (time) => {
        const pulse = Math.sin(time * 2.8 + 0.8) * 0.5 + 0.5;
        inferiorVenaConnection.scale.setScalar(1 + pulse * 0.25);
        inferiorVenaConnection.material.opacity = 0.6 + pulse * 0.3;
    };
    
    // 肺静脉入口 - 红色发光球（肺静脉流动脉血）
    const pulmonaryVeinConnectionL = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 16, 16),
        new THREE.MeshBasicMaterial({
            color: 0xff6666,
            transparent: true,
            opacity: 0.8
        })
    );
    pulmonaryVeinConnectionL.position.set(-0.7, 4, 0);
    scene.add(pulmonaryVeinConnectionL);
    
    pulmonaryVeinConnectionL.userData.animate = (time) => {
        const pulse = Math.sin(time * 3.2) * 0.5 + 0.5;
        pulmonaryVeinConnectionL.scale.setScalar(1 + pulse * 0.3);
        pulmonaryVeinConnectionL.material.opacity = 0.6 + pulse * 0.4;
    };
    
    const pulmonaryVeinConnectionR = new THREE.Mesh(
        new THREE.SphereGeometry(0.15, 16, 16),
        new THREE.MeshBasicMaterial({
            color: 0xff6666,
            transparent: true,
            opacity: 0.8
        })
    );
    pulmonaryVeinConnectionR.position.set(0.7, 4, 0);
    scene.add(pulmonaryVeinConnectionR);
    
    pulmonaryVeinConnectionR.userData.animate = (time) => {
        const pulse = Math.sin(time * 3.2 + 0.4) * 0.5 + 0.5;
        pulmonaryVeinConnectionR.scale.setScalar(1 + pulse * 0.3);
        pulmonaryVeinConnectionR.material.opacity = 0.6 + pulse * 0.4;
    };
    
    // 添加标签文字（可选）
    addVesselLabels();
}

// 添加血管标签
function addVesselLabels() {
    // 注：这里可以添加CSS2D标签，但为了简单起见，我们先使用点击提示
    console.log('血管连接点已创建');
}

// 创建动脉分支
function createArteryBranches(group, material) {
    // 颈动脉
    const carotidLeft = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.5, 7, 0),
        new THREE.Vector3(-0.6, 8, 0),
        new THREE.Vector3(-0.7, 9, 0)
    ]);
    const carotidLeftMesh = new THREE.Mesh(
        new THREE.TubeGeometry(carotidLeft, 20, 0.15, 10, false),
        material
    );
    carotidLeftMesh.userData.type = 'artery';
    group.add(carotidLeftMesh);

    const carotidRight = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.5, 7, 0),
        new THREE.Vector3(0.6, 8, 0),
        new THREE.Vector3(0.7, 9, 0)
    ]);
    const carotidRightMesh = new THREE.Mesh(
        new THREE.TubeGeometry(carotidRight, 20, 0.15, 10, false),
        material
    );
    carotidRightMesh.userData.type = 'artery';
    group.add(carotidRightMesh);

    // 锁骨下动脉
    const subclavianLeft = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-1, 7, 0),
        new THREE.Vector3(-1.8, 6.8, 0.2),
        new THREE.Vector3(-2.5, 6.5, 0.5)
    ]);
    const subclavianLeftMesh = new THREE.Mesh(
        new THREE.TubeGeometry(subclavianLeft, 20, 0.18, 10, false),
        material
    );
    subclavianLeftMesh.userData.type = 'artery';
    group.add(subclavianLeftMesh);

    const subclavianRight = new THREE.CatmullRomCurve3([
        new THREE.Vector3(1, 7, 0),
        new THREE.Vector3(1.8, 6.8, 0.2),
        new THREE.Vector3(2.5, 6.5, 0.5)
    ]);
    const subclavianRightMesh = new THREE.Mesh(
        new THREE.TubeGeometry(subclavianRight, 20, 0.18, 10, false),
        material
    );
    subclavianRightMesh.userData.type = 'artery';
    group.add(subclavianRightMesh);
    
    // 肠系膜动脉 - 供应肠道
    const mesentericArtery = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, -0.5),
        new THREE.Vector3(0, -0.5, -0.8),
        new THREE.Vector3(0, -1, -1.2)
    ]);
    const mesentericArteryMesh = new THREE.Mesh(
        new THREE.TubeGeometry(mesentericArtery, 15, 0.12, 8, false),
        material
    );
    mesentericArteryMesh.userData.type = 'artery';
    group.add(mesentericArteryMesh);
    
    // 股动脉 - 供应腿部
    const femoralLeft = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.9, -0.8, 0),
        new THREE.Vector3(-0.9, -2, 0),
        new THREE.Vector3(-0.9, -3.5, 0)
    ]);
    const femoralLeftMesh = new THREE.Mesh(
        new THREE.TubeGeometry(femoralLeft, 20, 0.14, 8, false),
        material
    );
    femoralLeftMesh.userData.type = 'artery';
    group.add(femoralLeftMesh);
    
    const femoralRight = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.9, -0.8, 0),
        new THREE.Vector3(0.9, -2, 0),
        new THREE.Vector3(0.9, -3.5, 0)
    ]);
    const femoralRightMesh = new THREE.Mesh(
        new THREE.TubeGeometry(femoralRight, 20, 0.14, 8, false),
        material
    );
    femoralRightMesh.userData.type = 'artery';
    group.add(femoralRightMesh);
}

// 创建静脉分支
function createVeinBranches(group, material) {
    // 颈静脉
    const jugularLeft = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.6, 9, 0.2),
        new THREE.Vector3(-0.7, 8, 0.3),
        new THREE.Vector3(-0.8, 7, 0.4)
    ]);
    const jugularLeftMesh = new THREE.Mesh(
        new THREE.TubeGeometry(jugularLeft, 20, 0.16, 10, false),
        material
    );
    jugularLeftMesh.userData.type = 'vein';
    group.add(jugularLeftMesh);
    
    const jugularRight = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.6, 9, 0.2),
        new THREE.Vector3(0.7, 8, 0.3),
        new THREE.Vector3(0.8, 7, 0.4)
    ]);
    const jugularRightMesh = new THREE.Mesh(
        new THREE.TubeGeometry(jugularRight, 20, 0.16, 10, false),
        material
    );
    jugularRightMesh.userData.type = 'vein';
    group.add(jugularRightMesh);
    
    // 锁骨下静脉
    const subclavianVeinLeft = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-2.5, 6.5, 0.6),
        new THREE.Vector3(-1.8, 6.8, 0.5),
        new THREE.Vector3(-1, 7.2, 0.5)
    ]);
    const subclavianVeinLeftMesh = new THREE.Mesh(
        new THREE.TubeGeometry(subclavianVeinLeft, 20, 0.18, 10, false),
        material
    );
    subclavianVeinLeftMesh.userData.type = 'vein';
    group.add(subclavianVeinLeftMesh);
    
    const subclavianVeinRight = new THREE.CatmullRomCurve3([
        new THREE.Vector3(2.5, 6.5, 0.6),
        new THREE.Vector3(1.8, 6.8, 0.5),
        new THREE.Vector3(1, 7.2, 0.5)
    ]);
    const subclavianVeinRightMesh = new THREE.Mesh(
        new THREE.TubeGeometry(subclavianVeinRight, 20, 0.18, 10, false),
        material
    );
    subclavianVeinRightMesh.userData.type = 'vein';
    group.add(subclavianVeinRightMesh);
    
    // 门静脉 - 从肠道到肝脏
    const portalVein = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, -1, -1.2),
        new THREE.Vector3(0.5, -0.5, -1),
        new THREE.Vector3(1, 0, -0.8)
    ]);
    const portalVeinMesh = new THREE.Mesh(
        new THREE.TubeGeometry(portalVein, 15, 0.13, 8, false),
        material
    );
    portalVeinMesh.userData.type = 'vein';
    group.add(portalVeinMesh);
    
    // 股静脉 - 腿部回流
    const femoralVeinLeft = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.95, -3.5, 0.2),
        new THREE.Vector3(-0.95, -2, 0.3),
        new THREE.Vector3(-0.9, -0.8, 0.4)
    ]);
    const femoralVeinLeftMesh = new THREE.Mesh(
        new THREE.TubeGeometry(femoralVeinLeft, 20, 0.15, 8, false),
        material
    );
    femoralVeinLeftMesh.userData.type = 'vein';
    group.add(femoralVeinLeftMesh);
    
    const femoralVeinRight = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.95, -3.5, 0.2),
        new THREE.Vector3(0.95, -2, 0.3),
        new THREE.Vector3(0.9, -0.8, 0.4)
    ]);
    const femoralVeinRightMesh = new THREE.Mesh(
        new THREE.TubeGeometry(femoralVeinRight, 20, 0.15, 8, false),
        material
    );
    femoralVeinRightMesh.userData.type = 'vein';
    group.add(femoralVeinRightMesh);
}

// 创建血液流动粒子系统（循环动画）- 增强版：三种速度 + 毛细血管单文件
function createBloodFlow() {
    // 体循环路径（大循环）
    const systemicPath = new THREE.CatmullRomCurve3([
        // 左心室 -> 主动脉
        new THREE.Vector3(-0.4, 2.5, 0),
        new THREE.Vector3(0, 4, 0),
        new THREE.Vector3(0, 6.5, 0),
        // 动脉弓 -> 全身
        new THREE.Vector3(2, 6.5, -0.3),
        new THREE.Vector3(3, 5, -0.8),
        // 毛细血管网（头部）
        new THREE.Vector3(2.5, 4, -0.5),
        new THREE.Vector3(2, 3, 0),
        // 静脉回流
        new THREE.Vector3(1, 5, 0.5),
        new THREE.Vector3(0.8, 3.5, 0.5),
        // 右心房
        new THREE.Vector3(0.6, 3.5, 0.3)
    ]);

    // 肺循环路径（小循环）
    const pulmonaryPath = new THREE.CatmullRomCurve3([
        // 右心室 -> 肺动脉
        new THREE.Vector3(0.5, 2.5, 0.3),
        new THREE.Vector3(0.5, 3.5, 0),
        new THREE.Vector3(-1, 4, -0.5),
        // 左肺
        new THREE.Vector3(-2, 4.5, -1),
        new THREE.Vector3(-2.2, 4.2, -1.2),
        // 肺静脉
        new THREE.Vector3(-1.5, 4, -0.8),
        new THREE.Vector3(-0.8, 3.8, -0.3),
        // 左心房
        new THREE.Vector3(-0.5, 3.5, 0)
    ]);

    // === 1. 动脉中的血液粒子（快速）===
    const arteryParticleCount = 150;  // 从100增加到150，更密集
    // 增大血液粒子，使其更明显
    const arteryParticleGeo = new THREE.SphereGeometry(0.12, 8, 8);  // 从0.1增大到0.12
    const arteryParticleMat = new THREE.MeshPhysicalMaterial({
        color: 0xff0000,  // 纯红色
        emissive: 0xff0000,
        emissiveIntensity: 1.2,  // 强发光
        transparent: true,
        opacity: 1.0,  // 完全不透明，确保可见
        metalness: 0.2,
        roughness: 0.3
    });

    for (let i = 0; i < arteryParticleCount; i++) {
        const particle = new THREE.Mesh(arteryParticleGeo, arteryParticleMat);
        particle.userData.path = systemicPath;
        particle.userData.progress = i / arteryParticleCount;
        particle.userData.speed = 0.003 + Math.random() * 0.002;  // 快速（40cm/s）
        particle.userData.type = 'bloodParticle';
        particle.userData.vesselType = 'artery';
        bloodParticles.push(particle);
        scene.add(particle);
    }

    // === 2. 静脉中的血液粒子（中速）===
    const veinParticleCount = 120;  // 从80增加到120，更密集
    // 增大静脉粒子，使其更明显
    const veinParticleGeo = new THREE.SphereGeometry(0.11, 8, 8);  // 从0.09增大到0.11
    const veinParticleMat = new THREE.MeshPhysicalMaterial({
        color: 0x0044ff,  // 更鲜艳的蓝色
        emissive: 0x3366ff,
        emissiveIntensity: 1.1,  // 强发光
        transparent: true,
        opacity: 1.0,  // 完全不透明，确保可见
        metalness: 0.2,
        roughness: 0.4
    });

    for (let i = 0; i < veinParticleCount; i++) {
        const particle = new THREE.Mesh(veinParticleGeo, veinParticleMat);
        particle.userData.path = systemicPath;
        particle.userData.progress = i / veinParticleCount;
        particle.userData.speed = 0.0015 + Math.random() * 0.001;  // 中速（15cm/s）
        particle.userData.type = 'bloodParticle';
        particle.userData.vesselType = 'vein';
        bloodParticles.push(particle);
        scene.add(particle);
    }

    // === 3. 肺循环粒子（蓝色转红色）===
    const pulmonaryParticleCount = 80;
    
    for (let i = 0; i < pulmonaryParticleCount; i++) {
        const progress = i / pulmonaryParticleCount;
        // 根据进度改变颜色（从蓝色到红色）
        const color = new THREE.Color();
        color.setHSL(0.6 - progress * 0.6, 0.8, 0.5); // 从蓝色渐变到红色
        
        const particleMat = new THREE.MeshPhysicalMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.6,
            transparent: true,
            opacity: 0.9,
            metalness: 0.2,
            roughness: 0.3
        });
        
        const particle = new THREE.Mesh(arteryParticleGeo, particleMat);
        particle.userData.path = pulmonaryPath;
        particle.userData.progress = progress;
        particle.userData.speed = 0.002 + Math.random() * 0.001;
        particle.userData.type = 'bloodParticle';
        particle.userData.isPulmonary = true;
        particle.userData.vesselType = 'pulmonary';
        bloodParticles.push(particle);
        scene.add(particle);
    }

    // === 4. 毛细血管中的红细胞（极慢速，单文件通过）===
    createCapillaryBloodCells();
}

// 创建毛细血管中的红细胞（单文件通过）
function createCapillaryBloodCells() {
    // 毛细血管路径定义（在各个器官的毛细血管网中）
    const capillaryPaths = [
        // 肺部毛细血管
        {
            path: new THREE.CatmullRomCurve3([
                new THREE.Vector3(-2, 4.8, -1),
                new THREE.Vector3(-2.1, 4.5, -1.1),
                new THREE.Vector3(-2.2, 4.2, -1.15),
                new THREE.Vector3(-2.2, 4.0, -1.1),
                new THREE.Vector3(-2.1, 3.8, -1.0)
            ]),
            count: 8
        },
        // 肝脏毛细血管
        {
            path: new THREE.CatmullRomCurve3([
                new THREE.Vector3(1.5, 0.5, -1.2),
                new THREE.Vector3(1.6, 0.3, -1.4),
                new THREE.Vector3(1.7, 0.1, -1.5),
                new THREE.Vector3(1.8, 0, -1.4),
                new THREE.Vector3(1.9, 0.2, -1.3)
            ]),
            count: 6
        },
        // 胃部毛细血管
        {
            path: new THREE.CatmullRomCurve3([
                new THREE.Vector3(-1.2, 1, -0.4),
                new THREE.Vector3(-1.4, 0.8, -0.5),
                new THREE.Vector3(-1.5, 0.6, -0.55),
                new THREE.Vector3(-1.6, 0.7, -0.6),
                new THREE.Vector3(-1.7, 0.9, -0.6)
            ]),
            count: 5
        },
        // 头部毛细血管
        {
            path: new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 9, 0.1),
                new THREE.Vector3(0.2, 9.1, 0.05),
                new THREE.Vector3(0.3, 9.2, 0),
                new THREE.Vector3(0.2, 9.2, 0.1),
                new THREE.Vector3(0, 9.1, 0.2)
            ]),
            count: 5
        }
    ];

    // 红细胞模型（双凹圆盘状）
    const redBloodCellGeo = new THREE.SphereGeometry(0.04, 8, 8);
    redBloodCellGeo.scale(1, 0.4, 1);  // 压扁成圆盘状

    capillaryPaths.forEach((capPath, pathIndex) => {
        for (let i = 0; i < capPath.count; i++) {
            // 创建红细胞
            const redBloodCell = new THREE.Mesh(
                redBloodCellGeo,
                new THREE.MeshPhysicalMaterial({
                    color: 0xff4444,
                    emissive: 0xaa0000,
                    emissiveIntensity: 0.5,
                    transparent: true,
                    opacity: 0.95,
                    metalness: 0.3,
                    roughness: 0.4,
                    clearcoat: 0.5
                })
            );

            // 单文件排列：每个红细胞均匀分布在路径上
            redBloodCell.userData.path = capPath.path;
            redBloodCell.userData.progress = i / capPath.count;
            redBloodCell.userData.speed = 0.0003 + Math.random() * 0.0002;  // 极慢（0.3mm/s）
            redBloodCell.userData.type = 'bloodParticle';
            redBloodCell.userData.vesselType = 'capillary';
            redBloodCell.userData.pathIndex = pathIndex;
            
            // 添加旋转动画（红细胞在毛细血管中翻滚）
            redBloodCell.userData.rotationSpeed = 0.5 + Math.random() * 0.5;

            bloodParticles.push(redBloodCell);
            scene.add(redBloodCell);
        }
    });

    // 添加额外的散在各器官的粒子
    const organBloodParticles = 50;
    const organParticleGeo = new THREE.SphereGeometry(0.06, 6, 6);
    
    for (let i = 0; i < organBloodParticles; i++) {
        const particleMat = new THREE.MeshBasicMaterial({
            color: Math.random() > 0.5 ? 0xff3333 : 0x3366ff,
            transparent: true,
            opacity: 0.7
        });
        
        const particle = new THREE.Mesh(organParticleGeo, particleMat);
        particle.position.set(
            (Math.random() - 0.5) * 8,
            Math.random() * 10 - 2,
            (Math.random() - 0.5) * 4
        );
        particle.userData.type = 'organBlood';
        particle.userData.floatSpeed = Math.random() * 0.015;
        particle.userData.floatPhase = Math.random() * Math.PI * 2;
        bloodParticles.push(particle);
        scene.add(particle);
    }
}

// 添加环境装饰
function addEnvironment() {
    // 添加高质量星空背景
    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 3000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
        // 位置
        positions[i * 3] = (Math.random() - 0.5) * 150;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 150;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 150;
        
        // 颜色（从蓝色到白色）
        const colorValue = 0.7 + Math.random() * 0.3;
        colors[i * 3] = colorValue;
        colors[i * 3 + 1] = colorValue * 0.95;
        colors[i * 3 + 2] = 1;
        
        // 大小
        sizes[i] = Math.random() * 2 + 0.5;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const starsMaterial = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    // 添加星云效果
    const nebulaGeometry = new THREE.BufferGeometry();
    const nebulaCount = 500;
    const nebulaPositions = new Float32Array(nebulaCount * 3);
    const nebulaColors = new Float32Array(nebulaCount * 3);

    for (let i = 0; i < nebulaCount; i++) {
        nebulaPositions[i * 3] = (Math.random() - 0.5) * 100;
        nebulaPositions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        nebulaPositions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        
        // 紫红色星云
        nebulaColors[i * 3] = 0.5 + Math.random() * 0.5;
        nebulaColors[i * 3 + 1] = 0.2;
        nebulaColors[i * 3 + 2] = 0.8;
    }

    nebulaGeometry.setAttribute('position', new THREE.BufferAttribute(nebulaPositions, 3));
    nebulaGeometry.setAttribute('color', new THREE.BufferAttribute(nebulaColors, 3));

    const nebulaMaterial = new THREE.PointsMaterial({
        size: 0.8,
        vertexColors: true,
        transparent: true,
        opacity: 0.3,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const nebula = new THREE.Points(nebulaGeometry, nebulaMaterial);
    scene.add(nebula);

    // 添加旋转动画
    stars.userData.animate = (time) => {
        stars.rotation.y = time * 0.015;
        stars.rotation.x = Math.sin(time * 0.01) * 0.1;
    };
    
    nebula.userData.animate = (time) => {
        nebula.rotation.y = -time * 0.008;
        nebula.rotation.z = Math.cos(time * 0.01) * 0.05;
    };

    // 添加地面网格
    const gridHelper = new THREE.GridHelper(50, 50, 0x222244, 0x111122);
    gridHelper.position.y = -8;
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    gridHelper.material.blending = THREE.AdditiveBlending;
    scene.add(gridHelper);
    
    // 添加圆形光环
    const ringGeometry = new THREE.RingGeometry(12, 12.5, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x4488ff,
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = -7.9;
    scene.add(ring);
    
    ring.userData.animate = (time) => {
        ring.rotation.z = time * 0.1;
        ring.material.opacity = 0.15 + Math.sin(time * 2) * 0.1;
    };
}

// 聚焦到特定部位
function focusOnPart(part) {
    let targetGroup, position, distance;

    switch (part) {
        case 'skeleton':
            // 骨骼系统已移除
            return;
        case 'heart':
            targetGroup = heartGroup;
            position = new THREE.Vector3(0, 3, 0);
            distance = 10;
            highlightGroup(heartGroup);
            break;
        case 'lungs':
            targetGroup = lungsGroup;
            position = new THREE.Vector3(0, 4, -1);
            distance = 12;
            highlightGroup(lungsGroup);
            break;
        case 'liver':
            targetGroup = liverGroup;
            position = new THREE.Vector3(1, 0, -1.5);
            distance = 10;
            highlightGroup(liverGroup);
            break;
        case 'stomach':
            targetGroup = stomachGroup;
            position = new THREE.Vector3(-1.5, 0.5, -0.5);
            distance = 8;
            highlightGroup(stomachGroup);
            break;
        case 'artery':
            position = new THREE.Vector3(0, 3, 0);
            distance = 15;
            highlightArtery();
            break;
        case 'vein':
            position = new THREE.Vector3(0, 3, 0);
            distance = 15;
            highlightVein();
            break;
        case 'capillary':
            position = new THREE.Vector3(0, 3, 0);
            distance = 15;
            highlightCapillary();
            break;
        case 'circulation':
            position = new THREE.Vector3(0, 3, 0);
            distance = 15;
            highlightBloodFlow();
            break;
        case 'reset':
            position = new THREE.Vector3(0, 3, 0);
            distance = 20;
            resetHighlight();
            break;
    }

    // 更新信息面板
    updateInfoPanel(part);

    // 平滑移动相机
    animateCamera(position, distance);
}

// 高亮显示组
function highlightGroup(group) {
    // 重置所有组
    resetHighlight();

    // 高亮选中的组
    if (group) {
        group.traverse((child) => {
            if (child.isMesh && child.material) {
                if (child.material.emissiveIntensity !== undefined) {
                    child.material.emissiveIntensity = 0.8;
                }
                child.material.opacity = 1;
            }
        });

        // 降低其他组的透明度
        const allGroups = [heartGroup, lungsGroup, liverGroup, stomachGroup];
        allGroups.forEach(g => {
            if (g && g !== group) {
                g.traverse((child) => {
                    if (child.isMesh && child.material) {
                        child.material.opacity = 0.15;
                    }
                });
            }
        });
        
        // 降低血管透明度
        if (arterySystem) arterySystem.traverse(c => { if (c.isMesh) c.material.opacity = 0.2; });
        if (veinSystem) veinSystem.traverse(c => { if (c.isMesh) c.material.opacity = 0.2; });
        if (capillarySystem) capillarySystem.traverse(c => { if (c.isMesh) c.material.opacity = 0.1; });
    }
}

// 高亮血液循环
function highlightBloodFlow() {
    resetHighlight();
    
    // 高亮血管系统
    if (arterySystem) {
        arterySystem.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.emissiveIntensity = 0.6;
                child.material.opacity = 1;
            }
        });
    }
    
    if (veinSystem) {
        veinSystem.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.emissiveIntensity = 0.5;
                child.material.opacity = 0.95;
            }
        });
    }
    
    if (capillarySystem) {
        capillarySystem.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.emissiveIntensity = 0.6;
                child.material.opacity = 0.8;
            }
        });
    }
    
    // 增强血液粒子显示
    bloodParticles.forEach(particle => {
        if (particle.material) {
            particle.material.opacity = 1;
            particle.scale.setScalar(1.5);
        }
    });
    
    // 降低器官透明度
    const allGroups = [skeletonGroup, heartGroup, lungsGroup, liverGroup, stomachGroup];
    allGroups.forEach(g => {
        if (g) {
            g.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.opacity = 0.25;
                }
            });
        }
    });
}

// 高亮动脉系统
function highlightArtery() {
    resetHighlight();
    
    // 高亮动脉
    if (arterySystem) {
        arterySystem.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.emissiveIntensity = 0.8;
                child.material.opacity = 1;
            }
        });
    }
    
    // 降低静脉和毛细血管透明度
    if (veinSystem) {
        veinSystem.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.emissiveIntensity = 0.1;
                child.material.opacity = 0.2;
            }
        });
    }
    
    if (capillarySystem) {
        capillarySystem.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.emissiveIntensity = 0.1;
                child.material.opacity = 0.15;
            }
        });
    }
    
    // 增强动脉血液粒子显示
    bloodParticles.forEach(particle => {
        if (particle.material && !particle.userData.isPulmonary) {
            particle.material.opacity = 1.5;
            particle.scale.setScalar(1.5);
        } else if (particle.material) {
            particle.material.opacity = 0.3;
            particle.scale.setScalar(0.5);
        }
    });
    
    // 降低器官透明度
    const allGroups = [heartGroup, lungsGroup, liverGroup, stomachGroup];
    allGroups.forEach(g => {
        if (g) {
            g.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.opacity = 0.2;
                }
            });
        }
    });
}

// 高亮静脉系统
function highlightVein() {
    resetHighlight();
    
    // 高亮静脉
    if (veinSystem) {
        veinSystem.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.emissiveIntensity = 0.8;
                child.material.opacity = 1;
            }
        });
    }
    
    // 降低动脉和毛细血管透明度
    if (arterySystem) {
        arterySystem.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.emissiveIntensity = 0.1;
                child.material.opacity = 0.2;
            }
        });
    }
    
    if (capillarySystem) {
        capillarySystem.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.emissiveIntensity = 0.1;
                child.material.opacity = 0.15;
            }
        });
    }
    
    // 增强静脉血液粒子显示
    bloodParticles.forEach(particle => {
        if (particle.material && particle.userData.isPulmonary) {
            particle.material.opacity = 1.5;
            particle.scale.setScalar(1.5);
        } else if (particle.material) {
            particle.material.opacity = 0.3;
            particle.scale.setScalar(0.5);
        }
    });
    
    // 降低器官透明度
    const allGroups = [heartGroup, lungsGroup, liverGroup, stomachGroup];
    allGroups.forEach(g => {
        if (g) {
            g.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.opacity = 0.2;
                }
            });
        }
    });
}

// 高亮毛细血管系统
function highlightCapillary() {
    resetHighlight();
    
    // 高亮毛细血管
    if (capillarySystem) {
        capillarySystem.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.emissiveIntensity = 0.9;
                child.material.opacity = 1;
            }
        });
    }
    
    // 降低动脉和静脉透明度
    if (arterySystem) {
        arterySystem.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.emissiveIntensity = 0.1;
                child.material.opacity = 0.2;
            }
        });
    }
    
    if (veinSystem) {
        veinSystem.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.emissiveIntensity = 0.1;
                child.material.opacity = 0.2;
            }
        });
    }
    
    // 减少血液粒子显示（毛细血管中的血液流速很慢）
    bloodParticles.forEach(particle => {
        if (particle.material) {
            particle.material.opacity = 0.4;
            particle.scale.setScalar(0.8);
        }
    });
    
    // 降低器官透明度，但保持可见以显示毛细血管的位置
    const allGroups = [heartGroup, lungsGroup, liverGroup, stomachGroup];
    allGroups.forEach(g => {
        if (g) {
            g.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.opacity = 0.15;
                }
            });
        }
    });
}

// 重置高亮
function resetHighlight() {
    // 骨骼系统已移除
    
    // 恢复心脏
    if (heartGroup) {
        heartGroup.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.emissiveIntensity = 0.4;
                child.material.opacity = 0.95;
            }
        });
    }
    
    // 恢复肺
    if (lungsGroup) {
        lungsGroup.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.emissiveIntensity = 0.2;
                child.material.opacity = 0.7;
            }
        });
    }
    
    // 恢复肝脏
    if (liverGroup) {
        liverGroup.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.emissiveIntensity = 0.3;
                child.material.opacity = 0.85;
            }
        });
    }
    
    // 恢复胃
    if (stomachGroup) {
        stomachGroup.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.emissiveIntensity = 0.2;
                child.material.opacity = 0.8;
            }
        });
    }
    
    // 恢复动脉
    if (arterySystem) {
        arterySystem.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.emissiveIntensity = 0.4;
                child.material.opacity = 0.8;
            }
        });
    }
    
    // 恢复静脉
    if (veinSystem) {
        veinSystem.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.emissiveIntensity = 0.3;
                child.material.opacity = 0.75;
            }
        });
    }
    
    // 恢复毛细血管
    if (capillarySystem) {
        capillarySystem.traverse((child) => {
            if (child.isMesh && child.material) {
                child.material.emissiveIntensity = 0.4;
                child.material.opacity = 0.6;
            }
        });
    }
    
    // 恢复血液粒子
    bloodParticles.forEach(particle => {
        if (particle.material) {
            particle.material.opacity = 0.9;
            particle.scale.setScalar(1);
        }
    });
}

// 更新信息面板
function updateInfoPanel(part) {
    const infoPanel = document.getElementById('info-panel');
    const knowledge = knowledgeBase[part];

    if (knowledge) {
        infoPanel.innerHTML = `<h2>${knowledge.title}</h2>${knowledge.content}`;
    }
}

// 相机动画
function animateCamera(targetPosition, distance) {
    const startPosition = camera.position.clone();
    const startTarget = controls.target.clone();
    const duration = 1500;
    const startTime = Date.now();

    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = easeInOutCubic(progress);

        // 计算新位置
        const newTarget = startTarget.clone().lerp(targetPosition, easeProgress);
        controls.target.copy(newTarget);

        // 计算相机位置
        const direction = startPosition.clone().sub(startTarget).normalize();
        const newCameraPos = newTarget.clone().add(direction.multiplyScalar(distance));
        camera.position.lerp(newCameraPos, easeProgress);

        controls.update();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    update();
}

// 缓动函数
function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// 鼠标移动事件（添加悬停高亮）
function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const allObjects = [];
    const allGroups = [heartGroup, lungsGroup, liverGroup, stomachGroup, 
                       arterySystem, veinSystem, capillarySystem];
    
    allGroups.forEach(group => {
        if (group) {
            group.traverse((child) => {
                if (child.isMesh) {
                    allObjects.push(child);
                }
            });
        }
    });

    const intersects = raycaster.intersectObjects(allObjects);

    // 重置所有物体的高亮
    document.body.style.cursor = 'default';
    
    // 移除之前的悬停提示
    const oldTooltip = document.getElementById('vessel-tooltip');
    if (oldTooltip) {
        oldTooltip.remove();
    }
    
    if (intersects.length > 0) {
        document.body.style.cursor = 'pointer';
        
        const hoveredObject = intersects[0].object;
        const objectType = hoveredObject.userData.type;
        
        // 为血管显示悬停提示
        if (objectType === 'artery' || objectType === 'vein' || objectType === 'capillary') {
            const tooltip = document.createElement('div');
            tooltip.id = 'vessel-tooltip';
            tooltip.style.position = 'fixed';
            tooltip.style.left = event.clientX + 15 + 'px';
            tooltip.style.top = event.clientY + 15 + 'px';
            tooltip.style.padding = '8px 15px';
            tooltip.style.borderRadius = '8px';
            tooltip.style.fontSize = '14px';
            tooltip.style.fontWeight = 'bold';
            tooltip.style.pointerEvents = 'none';
            tooltip.style.zIndex = '10000';
            tooltip.style.backdropFilter = 'blur(10px)';
            tooltip.style.border = '1px solid rgba(255, 255, 255, 0.3)';
            tooltip.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.5)';
            
            if (objectType === 'artery') {
                tooltip.style.background = 'rgba(255, 50, 50, 0.9)';
                tooltip.style.color = '#ffffff';
                tooltip.innerHTML = '🔴 动脉 (Artery)<br><span style="font-size:11px;opacity:0.9;">点击查看详细介绍</span>';
            } else if (objectType === 'vein') {
                tooltip.style.background = 'rgba(50, 50, 255, 0.9)';
                tooltip.style.color = '#ffffff';
                tooltip.innerHTML = '🔵 静脉 (Vein)<br><span style="font-size:11px;opacity:0.9;">点击查看详细介绍</span>';
            } else if (objectType === 'capillary') {
                tooltip.style.background = 'rgba(170, 100, 255, 0.9)';
                tooltip.style.color = '#ffffff';
                tooltip.innerHTML = '💜 毛细血管 (Capillary)<br><span style="font-size:11px;opacity:0.9;">点击查看详细介绍</span>';
            }
            
            document.body.appendChild(tooltip);
        }
    }
}

// 鼠标点击事件
function onMouseClick(event) {
    // 检查是否点击了按钮
    if (event.target.classList.contains('control-btn')) {
        return;
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const allObjects = [];
    const allGroups = [heartGroup, lungsGroup, liverGroup, stomachGroup,
                       arterySystem, veinSystem, capillarySystem];
    
    allGroups.forEach(group => {
        if (group) {
            group.traverse((child) => {
                if (child.isMesh) {
                    allObjects.push(child);
                }
            });
        }
    });

    const intersects = raycaster.intersectObjects(allObjects, false);  // 不递归，因为我们已经遍历了

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        let partType = clickedObject.userData.type;
        
        console.log('Clicked object type:', partType);  // 调试输出
        
        // 点击血管时，显示对应的血管类型介绍
        if (partType === 'artery' || partType === 'vein' || partType === 'capillary') {
            // 直接显示该类型血管的介绍
            focusOnPart(partType);
        } else if (partType) {
            // 其他器官正常处理
            focusOnPart(partType);
        }
    }
}

// 窗口大小调整
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

// 动画循环
function animate() {
    requestAnimationFrame(animate);

    const time = Date.now() * 0.001;

    // 心脏搏动动画
    if (heartGroup && heartGroup.userData.animate) {
        heartGroup.userData.animate(time);
    }

    // 肺呼吸动画
    if (lungsGroup && lungsGroup.userData.animate) {
        lungsGroup.userData.animate(time);
    }

    // 血液流动动画（循环播放）- 增强版：三种速度对比
    if (isCirculationPlaying && bloodParticles.length > 0) {
        bloodParticles.forEach(particle => {
            if (particle.userData.type === 'bloodParticle' && particle.userData.path) {
                // 更新进度（循环）
                particle.userData.progress += particle.userData.speed * animationSpeed;
                if (particle.userData.progress >= 1) {
                    particle.userData.progress = 0;
                }
                
                // 根据路径设置位置
                const pos = particle.userData.path.getPoint(particle.userData.progress);
                particle.position.copy(pos);
                
                // 毛细血管中的红细胞：旋转动画（模拟翻滚运动）
                if (particle.userData.vesselType === 'capillary') {
                    particle.rotation.x += particle.userData.rotationSpeed * 0.02;
                    particle.rotation.y += particle.userData.rotationSpeed * 0.015;
                    
                    // 轻微缩放变化（模拟挤压）
                    const squeeze = Math.sin(time * 2 + particle.userData.progress * 10) * 0.1 + 1;
                    particle.scale.set(squeeze, 1 / squeeze, squeeze);
                }
                
                // 如果是肺循环，更新颜色（从蓝到红）
                if (particle.userData.isPulmonary) {
                    const color = new THREE.Color();
                    color.setHSL(0.6 - particle.userData.progress * 0.6, 0.8, 0.5);
                    particle.material.color = color;
                    particle.material.emissive = color;
                }
                
                // 动脉中的血液：脉动效果
                if (particle.userData.vesselType === 'artery') {
                    const pulse = Math.sin(time * 3) * 0.15 + 1;
                    particle.scale.setScalar(pulse * 0.8);
                }
            } else if (particle.userData.type === 'organBlood') {
                // 器官周围的血液粒子漂浮
                particle.position.y += Math.sin(time * particle.userData.floatSpeed + particle.userData.floatPhase) * 0.005;
            }
        });
    }

    // 环境粒子旋转
    scene.children.forEach(child => {
        if (child.userData.animate) {
            child.userData.animate(time);
        }
    });

    controls.update();
    
    // 使用后期处理渲染器
    if (composer) {
        composer.render();
    } else {
        renderer.render(scene, camera);
    }
}

// 启动应用
init();
