import * as THREE from 'three';

// 创建骨骼系统
export function createSkeleton() {
    const skeletonGroup = new THREE.Group();
    skeletonGroup.userData.type = 'skeleton';

    const boneMaterial = new THREE.MeshPhongMaterial({
        color: 0xf5f5dc,
        emissive: 0x333333,
        emissiveIntensity: 0.1,
        shininess: 30,
        transparent: true,
        opacity: 0.85
    });

    // 脊柱
    const spineGeometry = new THREE.CylinderGeometry(0.3, 0.35, 12, 8);
    const spine = new THREE.Mesh(spineGeometry, boneMaterial);
    spine.position.set(0, 2, 0);
    spine.castShadow = true;
    spine.userData.type = 'skeleton';
    skeletonGroup.add(spine);

    // 添加脊椎骨节（椎骨）
    for (let i = 0; i < 12; i++) {
        const vertebraGeometry = new THREE.TorusGeometry(0.45, 0.12, 8, 12);
        const vertebra = new THREE.Mesh(vertebraGeometry, boneMaterial);
        vertebra.position.set(0, -3 + i * 1, 0);
        vertebra.rotation.x = Math.PI / 2;
        vertebra.userData.type = 'skeleton';
        skeletonGroup.add(vertebra);
    }

    // 肋骨（胸廓）
    for (let i = 0; i < 10; i++) {
        const ribHeight = 1 + i * 0.8;
        const ribCurve = new THREE.EllipseCurve(
            0, 0,
            2 + i * 0.15, 1.5 + i * 0.1,
            0, Math.PI,
            false,
            0
        );
        
        const ribPoints = ribCurve.getPoints(20);
        const ribPoints3D = ribPoints.map(p => new THREE.Vector3(p.x, ribHeight, p.y));
        
        const ribCurve3D = new THREE.CatmullRomCurve3(ribPoints3D);
        const ribGeometry = new THREE.TubeGeometry(ribCurve3D, 20, 0.1, 6, false);
        
        // 左侧肋骨
        const leftRib = new THREE.Mesh(ribGeometry, boneMaterial);
        leftRib.position.y = 2;
        leftRib.userData.type = 'skeleton';
        skeletonGroup.add(leftRib);
        
        // 右侧肋骨（镜像）
        const rightRib = leftRib.clone();
        rightRib.scale.x = -1;
        rightRib.userData.type = 'skeleton';
        skeletonGroup.add(rightRib);
    }

    // 颅骨（简化版）
    const skullGeometry = new THREE.SphereGeometry(1.5, 16, 16);
    const skull = new THREE.Mesh(skullGeometry, boneMaterial);
    skull.position.set(0, 10, 0);
    skull.scale.set(1, 1.2, 1);
    skull.castShadow = true;
    skull.userData.type = 'skeleton';
    skeletonGroup.add(skull);

    // 颈椎
    const neckGeometry = new THREE.CylinderGeometry(0.25, 0.3, 2, 8);
    const neck = new THREE.Mesh(neckGeometry, boneMaterial);
    neck.position.set(0, 8.5, 0);
    neck.userData.type = 'skeleton';
    skeletonGroup.add(neck);

    // 肩胛骨
    const shoulderGeometry = new THREE.BoxGeometry(0.8, 1.5, 0.2);
    const leftShoulder = new THREE.Mesh(shoulderGeometry, boneMaterial);
    leftShoulder.position.set(-2.5, 6, -0.5);
    leftShoulder.rotation.z = -0.3;
    leftShoulder.userData.type = 'skeleton';
    skeletonGroup.add(leftShoulder);

    const rightShoulder = leftShoulder.clone();
    rightShoulder.position.x = 2.5;
    rightShoulder.rotation.z = 0.3;
    rightShoulder.userData.type = 'skeleton';
    skeletonGroup.add(rightShoulder);

    // 骨盆
    const pelvisGeometry = new THREE.TorusGeometry(2, 0.3, 8, 16, Math.PI);
    const pelvis = new THREE.Mesh(pelvisGeometry, boneMaterial);
    pelvis.position.set(0, -3, 0);
    pelvis.rotation.x = Math.PI / 2;
    pelvis.userData.type = 'skeleton';
    skeletonGroup.add(pelvis);

    return skeletonGroup;
}

// 创建心脏
export function createHeart() {
    const heartGroup = new THREE.Group();
    heartGroup.userData.type = 'heart';

    const heartMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xe74c3c,
        emissive: 0xcc0000,
        emissiveIntensity: 0.4,
        metalness: 0.1,
        roughness: 0.4,
        transparent: true,
        opacity: 0.95,
        clearcoat: 0.5,
        clearcoatRoughness: 0.3
    });

    // 主心室（使用两个球体组合）
    const leftVentricleGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const leftVentricle = new THREE.Mesh(leftVentricleGeo, heartMaterial);
    leftVentricle.position.set(-0.4, 2.5, 0);
    leftVentricle.scale.set(1.1, 1.3, 1);
    leftVentricle.castShadow = true;
    leftVentricle.userData.type = 'heart';
    heartGroup.add(leftVentricle);

    const rightVentricleGeo = new THREE.SphereGeometry(1, 32, 32);
    const rightVentricle = new THREE.Mesh(rightVentricleGeo, heartMaterial);
    rightVentricle.position.set(0.5, 2.5, 0.3);
    rightVentricle.scale.set(1, 1.2, 0.9);
    rightVentricle.castShadow = true;
    rightVentricle.userData.type = 'heart';
    heartGroup.add(rightVentricle);

    // 心房
    const atriumMaterial = heartMaterial.clone();
    atriumMaterial.emissiveIntensity = 0.3;

    const leftAtriumGeo = new THREE.SphereGeometry(0.8, 24, 24);
    const leftAtrium = new THREE.Mesh(leftAtriumGeo, atriumMaterial);
    leftAtrium.position.set(-0.7, 4, -0.3);
    leftAtrium.userData.type = 'heart';
    heartGroup.add(leftAtrium);

    const rightAtriumGeo = new THREE.SphereGeometry(0.75, 24, 24);
    const rightAtrium = new THREE.Mesh(rightAtriumGeo, atriumMaterial);
    rightAtrium.position.set(0.6, 4, 0);
    rightAtrium.userData.type = 'heart';
    heartGroup.add(rightAtrium);

    // 添加心脏表面细节（冠状动脉）
    const coronaryMaterial = new THREE.MeshPhongMaterial({
        color: 0xaa0000,
        emissive: 0x660000,
        emissiveIntensity: 0.5
    });

    const coronaryCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.8, 3.5, 1),
        new THREE.Vector3(0, 2.5, 1.2),
        new THREE.Vector3(0.8, 2, 0.8),
        new THREE.Vector3(0.5, 1.5, 0.3)
    ]);

    const coronaryGeo = new THREE.TubeGeometry(coronaryCurve, 20, 0.08, 6, false);
    const coronary = new THREE.Mesh(coronaryGeo, coronaryMaterial);
    coronary.userData.type = 'heart';
    heartGroup.add(coronary);

    // 添加搏动动画
    heartGroup.userData.animate = (time) => {
        const beat = Math.sin(time * 3) * 0.08 + 1;
        heartGroup.scale.set(beat, beat, beat);
    };

    return heartGroup;
}

// 创建肺 - 优化版，更真实的肺部结构
export function createLungs() {
    const lungsGroup = new THREE.Group();
    lungsGroup.userData.type = 'lungs';

    // 更真实的肺部材质 - 海绵状质感
    const lungMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffc0cb,  // 浅粉红色，更接近真实肺部颜色
        emissive: 0xff8899,
        emissiveIntensity: 0.25,
        metalness: 0.05,
        roughness: 0.8,  // 更粗糙，模拟海绵质感
        transparent: true,
        opacity: 0.85,
        transmission: 0.05,
        clearcoat: 0.2,
        clearcoatRoughness: 0.7
    });

    // 左肺（两叶）- 更精细的造型
    const leftLungUpper = new THREE.Mesh(
        new THREE.SphereGeometry(1.3, 32, 32),  // 增加细分度
        lungMaterial
    );
    leftLungUpper.position.set(-1.8, 5.2, -0.8);
    leftLungUpper.scale.set(1, 1.4, 1.2);
    leftLungUpper.castShadow = true;
    leftLungUpper.receiveShadow = true;
    leftLungUpper.userData.type = 'lungs';
    leftLungUpper.userData.part = 'leftUpperLobe';
    lungsGroup.add(leftLungUpper);

    const leftLungLower = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 32, 32),
        lungMaterial
    );
    leftLungLower.position.set(-1.9, 3.2, -0.9);
    leftLungLower.scale.set(1, 1.3, 1.3);
    leftLungLower.castShadow = true;
    leftLungLower.receiveShadow = true;
    leftLungLower.userData.type = 'lungs';
    leftLungLower.userData.part = 'leftLowerLobe';
    lungsGroup.add(leftLungLower);

    // 右肺（三叶）- 右肺比左肺稍大
    const rightLungUpper = new THREE.Mesh(
        new THREE.SphereGeometry(1.3, 32, 32),
        lungMaterial
    );
    rightLungUpper.position.set(1.9, 5.5, -0.8);
    rightLungUpper.scale.set(1, 1.3, 1.3);
    rightLungUpper.castShadow = true;
    rightLungUpper.receiveShadow = true;
    rightLungUpper.userData.type = 'lungs';
    rightLungUpper.userData.part = 'rightUpperLobe';
    lungsGroup.add(rightLungUpper);

    const rightLungMiddle = new THREE.Mesh(
        new THREE.SphereGeometry(1.2, 32, 32),
        lungMaterial
    );
    rightLungMiddle.position.set(2, 4, -0.85);
    rightLungMiddle.scale.set(1, 1.2, 1.25);
    rightLungMiddle.castShadow = true;
    rightLungMiddle.receiveShadow = true;
    rightLungMiddle.userData.type = 'lungs';
    rightLungMiddle.userData.part = 'rightMiddleLobe';
    lungsGroup.add(rightLungMiddle);

    const rightLungLower = new THREE.Mesh(
        new THREE.SphereGeometry(1.15, 32, 32),
        lungMaterial
    );
    rightLungLower.position.set(2, 2.4, -0.9);
    rightLungLower.scale.set(1, 1.2, 1.3);
    rightLungLower.castShadow = true;
    rightLungLower.receiveShadow = true;
    rightLungLower.userData.type = 'lungs';
    rightLungLower.userData.part = 'rightLowerLobe';
    lungsGroup.add(rightLungLower);

    // 气管 - 更真实的造型和材质
    const tracheaGeometry = new THREE.CylinderGeometry(0.3, 0.28, 3.5, 16);
    const tracheaMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffe4e1,
        emissive: 0xffb6c1,
        emissiveIntensity: 0.15,
        metalness: 0.05,
        roughness: 0.7,
        transparent: true,
        opacity: 0.9,
        clearcoat: 0.3
    });
    const trachea = new THREE.Mesh(tracheaGeometry, tracheaMaterial);
    trachea.position.set(0, 6.8, -0.3);
    trachea.castShadow = true;
    trachea.userData.type = 'lungs';
    trachea.userData.part = 'trachea';
    lungsGroup.add(trachea);

    // 气管环（软骨环）- 增加真实感
    for (let i = 0; i < 12; i++) {
        const ringGeo = new THREE.TorusGeometry(0.32, 0.03, 8, 16);
        const ringMat = new THREE.MeshPhysicalMaterial({
            color: 0xffd1dc,
            metalness: 0.1,
            roughness: 0.6,
            emissive: 0xffc0cb,
            emissiveIntensity: 0.1
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(0, 8.3 - i * 0.3, -0.3);
        ring.rotation.x = Math.PI / 2;
        ring.userData.type = 'lungs';
        lungsGroup.add(ring);
    }

    // 主支气管 - 更精细的分支结构
    const bronchiMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffccd5,
        emissive: 0xffaabb,
        emissiveIntensity: 0.2,
        metalness: 0.05,
        roughness: 0.7,
        transparent: true,
        opacity: 0.9
    });

    // 左主支气管
    const leftMainBronchus = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 5.3, -0.3),
        new THREE.Vector3(-0.5, 5.1, -0.5),
        new THREE.Vector3(-1.2, 4.8, -0.7),
        new THREE.Vector3(-1.6, 4.5, -0.8)
    ]);
    const leftBronchi = new THREE.Mesh(
        new THREE.TubeGeometry(leftMainBronchus, 20, 0.18, 12, false),
        bronchiMaterial
    );
    leftBronchi.castShadow = true;
    leftBronchi.userData.type = 'lungs';
    leftBronchi.userData.part = 'leftBronchus';
    lungsGroup.add(leftBronchi);

    // 右主支气管
    const rightMainBronchus = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 5.3, -0.3),
        new THREE.Vector3(0.5, 5.1, -0.5),
        new THREE.Vector3(1.2, 4.8, -0.7),
        new THREE.Vector3(1.7, 4.5, -0.8)
    ]);
    const rightBronchi = new THREE.Mesh(
        new THREE.TubeGeometry(rightMainBronchus, 20, 0.18, 12, false),
        bronchiMaterial
    );
    rightBronchi.castShadow = true;
    rightBronchi.userData.type = 'lungs';
    rightBronchi.userData.part = 'rightBronchus';
    lungsGroup.add(rightBronchi);

    // 细支气管分支（左肺）
    const leftBronchiBranches = [
        { start: [-1.6, 4.5, -0.8], end: [-1.8, 5.0, -0.85] },
        { start: [-1.6, 4.5, -0.8], end: [-1.9, 3.8, -0.9] },
        { start: [-1.6, 4.5, -0.8], end: [-1.7, 4.0, -1.1] }
    ];

    leftBronchiBranches.forEach(branch => {
        const curve = new THREE.LineCurve3(
            new THREE.Vector3(...branch.start),
            new THREE.Vector3(...branch.end)
        );
        const tube = new THREE.Mesh(
            new THREE.TubeGeometry(curve, 8, 0.1, 10, false),
            bronchiMaterial
        );
        tube.userData.type = 'lungs';
        lungsGroup.add(tube);
    });

    // 细支气管分支（右肺）
    const rightBronchiBranches = [
        { start: [1.7, 4.5, -0.8], end: [1.9, 5.3, -0.85] },
        { start: [1.7, 4.5, -0.8], end: [2.0, 4.0, -0.9] },
        { start: [1.7, 4.5, -0.8], end: [2.0, 2.8, -0.95] },
        { start: [1.7, 4.5, -0.8], end: [1.8, 3.5, -1.1] }
    ];

    rightBronchiBranches.forEach(branch => {
        const curve = new THREE.LineCurve3(
            new THREE.Vector3(...branch.start),
            new THREE.Vector3(...branch.end)
        );
        const tube = new THREE.Mesh(
            new THREE.TubeGeometry(curve, 8, 0.1, 10, false),
            bronchiMaterial
        );
        tube.userData.type = 'lungs';
        lungsGroup.add(tube);
    });

    // 肺泡细节（小球体模拟肺泡群）
    const alveolarMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffddee,
        emissive: 0xffccdd,
        emissiveIntensity: 0.15,
        metalness: 0.02,
        roughness: 0.9,
        transparent: true,
        opacity: 0.6
    });

    // 在肺叶表面添加肺泡细节
    for (let i = 0; i < 40; i++) {
        const alveolarCluster = new THREE.Mesh(
            new THREE.SphereGeometry(0.08, 8, 8),
            alveolarMaterial
        );
        const side = i < 20 ? -1 : 1;  // 左右肺
        const angle = (i % 20 / 20) * Math.PI * 2;
        const height = 2.5 + Math.random() * 3;
        const radius = 1.2 + Math.random() * 0.4;
        
        alveolarCluster.position.set(
            side * (1.5 + Math.cos(angle) * radius),
            height,
            -0.8 + Math.sin(angle) * radius * 0.6
        );
        alveolarCluster.userData.type = 'lungs';
        lungsGroup.add(alveolarCluster);
    }

    // 更真实的呼吸动画 - 吸气和呼气节奏
    lungsGroup.userData.animate = (time) => {
        // 呼吸周期：4秒一次（正常呼吸频率约15次/分钟）
        const breathCycle = Math.sin(time * Math.PI / 2); // 慢速呼吸
        
        // 吸气时膨胀（0.95-1.08），呼气时收缩
        const breathExpansion = 1 + breathCycle * 0.06;
        
        lungsGroup.traverse((child) => {
            if (child.isMesh && child.userData.part && child.userData.part.includes('Lobe')) {
                // 肺叶的呼吸动画
                child.scale.set(
                    1 + breathCycle * 0.04,
                    breathExpansion,
                    1 + breathCycle * 0.05
                );
            }
        });
        
        // 气管轻微移动
        lungsGroup.children.forEach(child => {
            if (child.userData.part === 'trachea') {
                child.position.y = 6.8 + breathCycle * 0.08;
            }
        });
    };

    return lungsGroup;
}

// 创建肝脏
export function createLiver() {
    const liverGroup = new THREE.Group();
    liverGroup.userData.type = 'liver';

    const liverMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x8b4513,
        emissive: 0x654321,
        emissiveIntensity: 0.3,
        metalness: 0.2,
        roughness: 0.5,
        transparent: true,
        opacity: 0.85
    });

    // 肝脏主体（右叶）
    const rightLobe = new THREE.Mesh(
        new THREE.BoxGeometry(3, 2.5, 2),
        liverMaterial
    );
    rightLobe.position.set(1.5, 0, -1.5);
    rightLobe.scale.set(1, 0.8, 1);
    rightLobe.castShadow = true;
    rightLobe.userData.type = 'liver';
    
    // 圆角处理
    const edges = new THREE.EdgesGeometry(rightLobe.geometry);
    liverGroup.add(rightLobe);

    // 左叶
    const leftLobe = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 1.5),
        liverMaterial
    );
    leftLobe.position.set(-1, 0.3, -1.3);
    leftLobe.rotation.z = 0.2;
    leftLobe.userData.type = 'liver';
    liverGroup.add(leftLobe);

    // 添加表面细节
    const detailGeometry = new THREE.SphereGeometry(0.3, 8, 8);
    for (let i = 0; i < 5; i++) {
        const detail = new THREE.Mesh(detailGeometry, liverMaterial);
        detail.position.set(
            (Math.random() - 0.5) * 3,
            (Math.random() - 0.5) * 2,
            -1.5
        );
        detail.userData.type = 'liver';
        liverGroup.add(detail);
    }

    return liverGroup;
}

// 创建胃
export function createStomach() {
    const stomachGroup = new THREE.Group();
    stomachGroup.userData.type = 'stomach';

    const stomachMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffb6c1,
        emissive: 0xff69b4,
        emissiveIntensity: 0.2,
        metalness: 0.1,
        roughness: 0.6,
        transparent: true,
        opacity: 0.8
    });

    // 胃体（J形）
    const stomachBody = new THREE.Mesh(
        new THREE.SphereGeometry(1, 24, 24),
        stomachMaterial
    );
    stomachBody.position.set(-1.5, 0.5, -0.5);
    stomachBody.scale.set(1.2, 1.5, 0.8);
    stomachBody.castShadow = true;
    stomachBody.userData.type = 'stomach';
    stomachGroup.add(stomachBody);

    // 胃底
    const stomachFundus = new THREE.Mesh(
        new THREE.SphereGeometry(0.6, 20, 20),
        stomachMaterial
    );
    stomachFundus.position.set(-1.8, 1.5, -0.5);
    stomachFundus.userData.type = 'stomach';
    stomachGroup.add(stomachFundus);

    // 幽门
    const pylorus = new THREE.Mesh(
        new THREE.CylinderGeometry(0.3, 0.4, 0.8, 12),
        stomachMaterial
    );
    pylorus.position.set(-0.8, -0.5, -0.3);
    pylorus.rotation.z = Math.PI / 4;
    pylorus.userData.type = 'stomach';
    stomachGroup.add(pylorus);

    return stomachGroup;
}
