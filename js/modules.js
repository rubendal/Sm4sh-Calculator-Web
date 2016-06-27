﻿var app = angular.module('calculator', []);
app.controller('calculator', function ($scope) {
    loadGitHubData();
    $scope.characters = names;
    $scope.attackerValue = attacker.name;
    $scope.encodedAttackerValue = encodeURI(attacker.name.split("(")[0].trim());
    $scope.targetValue = target.name;
    $scope.attackerPercent = attacker_percent;
    $scope.targetPercent = target_percent;
    $scope.baseDamage = base_damage;
    $scope.angle = angle;
    $scope.in_air = in_air;
    $scope.bkb = bkb;
    $scope.kbg = kbg;
    $scope.stale = stale;
    $scope.kb_modifier = "none";
    $scope.training = List([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    $scope.vs = List([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    $scope.hitlag_modifier = "none";
    $scope.hitlag = hitlag;
    $scope.shield = "normal";
    $scope.hit_frame = 0;
    $scope.faf = 1;

    $scope.attacker_damage_dealt = attacker.modifier.damage_dealt;
    $scope.attacker_kb_dealt = attacker.modifier.kb_dealt;
    $scope.target_weight = target.attributes.weight;
    $scope.target_gravity = target.attributes.gravity;
    $scope.target_damage_taken = target.modifier.damage_taken;
    $scope.target_kb_received = target.modifier.kb_received;

    $scope.is_smash = false;
    $scope.is_smash_visibility = { 'display': $scope.is_smash ? 'initial' : 'none' };
    $scope.megaman_fsmash = false;
    $scope.is_megaman = { 'display': attacker.name == "Mega Man" ? 'initial' : 'none' };
    $scope.smashCharge = 0;
    $scope.set_kb = false;

    $scope.section_main = { 'background': 'rgba(0, 0, 255, 0.3)' };
    $scope.section_attributes = { 'background': 'transparent' };

    $scope.charging = function(){
        $scope.is_smash_visibility = { 'display': $scope.is_smash ? 'initial' : 'none' };
        $scope.is_megaman = { 'display': attacker.name == "Mega Man" ? 'initial' : 'none' };
        $scope.megaman_fsmash = false;
        $scope.smashCharge = 0;
        charge_frames = 0;
        $scope.update();
    };

    $scope.check = function () {
        $scope.is_megaman = { 'display': attacker.name == "Mega Man" ? 'initial' : 'none' };
        if (attacker.name != "Mega Man") {
            $scope.megaman_fsmash = false;
        }
    }

    $scope.updateAttr = function () {
        attacker.modifier.damage_dealt = parseFloat($scope.attacker_damage_dealt);
        attacker.modifier.kb_dealt = parseFloat($scope.attacker_kb_dealt);
        target.attributes.weight = parseFloat($scope.target_weight);
        target.attributes.gravity = parseFloat($scope.target_gravity);
        target.modifier.damage_taken = parseFloat($scope.target_damage_taken);
        target.modifier.kb_received = parseFloat($scope.target_kb_received);

        $scope.update();
    }

    $scope.show = function (section) {
        $scope.main_style = { 'display': section == "main" ? 'block' : 'none' };
        $scope.attributes_style = { 'display': section == "attributes" ? 'block' : 'none' };
        $scope.section_main = { 'background': section == "main" ? 'rgba(0, 0, 255, 0.3)': 'transparent' };
        $scope.section_attributes = { 'background': section == "attributes" ? 'rgba(0, 0, 255, 0.3)' : 'transparent' };
    }

    $scope.updateAttacker = function(){
        attacker = new Character($scope.attackerValue);
        $scope.attacker_damage_dealt = attacker.modifier.damage_dealt;
        $scope.attacker_kb_dealt = attacker.modifier.kb_dealt;
        $scope.update();
    }

    $scope.updateTarget = function () {
        target = new Character($scope.targetValue);
        $scope.target_weight = target.attributes.weight;
        $scope.target_gravity = target.attributes.gravity;
        $scope.target_damage_taken = target.modifier.damage_taken;
        $scope.target_kb_received = target.modifier.kb_received;
        $scope.update();
    }

    $scope.update = function () {
        $scope.check();
        $scope.encodedAttackerValue = encodeURI(attacker.name.split("(")[0].trim());
        attacker_percent = parseFloat($scope.attackerPercent);
        target_percent = parseFloat($scope.targetPercent);
        base_damage = parseFloat($scope.baseDamage);
        angle = parseFloat($scope.angle);
        in_air = $scope.in_air;
        bkb = parseFloat($scope.bkb);
        kbg = parseFloat($scope.kbg);
        stale = parseFloat($scope.stale);
        hitlag = parseFloat($scope.hitlag);

        var hitframe = parseFloat($scope.hit_frame);
        var faf = parseFloat($scope.faf);
        charge_frames = parseFloat($scope.smashCharge);
        KBModifier($scope.kb_modifier);
        var bounce = $scope.kb_modifier_bounce;
        var ignoreStale = $scope.ignoreStale;
        
        base_damage = ChargeSmash(base_damage, charge_frames, $scope.megaman_fsmash);
        var damage = base_damage;
        if (attacker.name == "Lucario") {
            damage *= Aura(attacker_percent);
        }
        damage *= attacker.modifier.damage_dealt;
        damage *= target.modifier.damage_taken;
        if (!$scope.set_kb) {
            trainingkb = TrainingKB(target_percent, base_damage, damage, target.attributes.weight, kbg, bkb, target.attributes.gravity, r, angle, in_air);
            vskb = VSKB(target_percent, base_damage, damage, target.attributes.weight, kbg, bkb, target.attributes.gravity, r, stale, ignoreStale, attacker_percent, angle, in_air);
        } else {
            trainingkb = new Knockback(bkb * r, angle, target.attributes.gravity, in_air);
            vskb = new Knockback(bkb * r * Rage(attacker_percent), angle, target.attributes.gravity, in_air);
        }
        trainingkb.addModifier(attacker.modifier.kb_dealt);
        trainingkb.addModifier(target.modifier.kb_received);
        vskb.addModifier(attacker.modifier.kb_dealt);
        vskb.addModifier(target.modifier.kb_received);
        trainingkb.bounce(bounce);
        vskb.bounce(bounce);
        var traininglist = List([damage, Hitlag(damage, $scope.is_projectile ? 0 : hitlag, 1, 1), Hitlag(damage, hitlag, HitlagElectric($scope.hitlag_modifier), HitlagCrouch($scope.kb_modifier)), trainingkb.kb, trainingkb.angle, trainingkb.x, trainingkb.y, Hitstun(trainingkb.base_kb), FirstActionableFrame(trainingkb.base_kb), AirdodgeCancel(trainingkb.base_kb), AerialCancel(trainingkb.base_kb)]);
        var vslist = List([StaleDamage(damage, stale, ignoreStale), Hitlag(damage, $scope.is_projectile ? 0 : hitlag, 1, 1), Hitlag(damage, hitlag, HitlagElectric($scope.hitlag_modifier), HitlagCrouch($scope.kb_modifier)), vskb.kb, vskb.angle, vskb.x, vskb.y, Hitstun(vskb.base_kb), FirstActionableFrame(vskb.base_kb), AirdodgeCancel(vskb.base_kb), AerialCancel(vskb.base_kb)]);
        if (r != 1) {
            traininglist.splice(3, 0, new ListItem("KB modifier", "x" + +r.toFixed(4)));
            vslist.splice(3, 0, new ListItem("KB modifier", "x" + +r.toFixed(4)));
        }
        vslist.splice(3, 0, new ListItem("Rage", "x" + +Rage(attacker_percent).toFixed(4)));
        if (target.modifier.kb_received != 1) {
            traininglist.splice(3, 0, new ListItem("KB received", "x" + +target.modifier.kb_received.toFixed(4)));
            vslist.splice(4, 0, new ListItem("KB received", "x" + +target.modifier.kb_received.toFixed(4)));
        }
        if (attacker.modifier.kb_dealt != 1) {
            traininglist.splice(3, 0, new ListItem("KB dealt", "x" + +attacker.modifier.kb_dealt.toFixed(4)));
            vslist.splice(4, 0, new ListItem("KB dealt", "x" + +attacker.modifier.kb_dealt.toFixed(4)));
        }
        if (attacker.name == "Lucario") {
            traininglist.splice(0, 0, new ListItem("Aura", "x" + +Aura(attacker_percent).toFixed(4)));
            vslist.splice(0, 0, new ListItem("Aura", "x" + +Aura(attacker_percent).toFixed(4)));
        }
        if ($scope.is_smash) {
            traininglist.splice(0, 0, new ListItem("Charged Smash", "x" + +ChargeSmashMultiplier(charge_frames, $scope.megaman_fsmash).toFixed(4)));
            vslist.splice(0, 0, new ListItem("Charged Smash", "x" + +ChargeSmashMultiplier(charge_frames, $scope.megaman_fsmash).toFixed(4)));
        }
        if (target.modifier.damage_taken != 1) {
            traininglist.splice(0, 0, new ListItem("Damage taken", "x" + +target.modifier.damage_taken.toFixed(4)));
            vslist.splice(0, 0, new ListItem("Damage taken", "x" + +target.modifier.damage_taken.toFixed(4)));
        }
        if (attacker.modifier.damage_dealt != 1) {
            traininglist.splice(0, 0, new ListItem("Damage dealt", "x" + +attacker.modifier.damage_dealt.toFixed(4)));
            vslist.splice(0, 0, new ListItem("Damage dealt", "x" + +attacker.modifier.damage_dealt.toFixed(4)));
        }
        vslist.splice(0, 0, new ListItem("Stale-move negation", "x" + +StaleNegation(stale, ignoreStale).toFixed(4)));
        
        traininglist.push(new ListItem("Tumble", trainingkb.tumble ? "Yes" : "No"));
        vslist.push(new ListItem("Tumble", vskb.tumble ? "Yes" : "No"));
        traininglist.push(new ListItem("Can Jab lock", trainingkb.can_jablock ? "Yes" : "No"));
        vslist.push(new ListItem("Can Jab lock", vskb.can_jablock ? "Yes" : "No"));

        //Shield stuff
        var powershield = $scope.shield == "power";
        var is_projectile = $scope.is_projectile == true;
        traininglist.push.apply(traininglist, ShieldList([ShieldStun(damage, is_projectile, powershield), ShieldHitlag(damage, hitlag, HitlagElectric($scope.hitlag_modifier)), ShieldAdvantage(damage, hitlag, hitframe, faf, is_projectile, HitlagElectric($scope.hitlag_modifier), powershield)]));
        vslist.push.apply(vslist, ShieldList([ShieldStun(damage, is_projectile, powershield), ShieldHitlag(damage, hitlag, HitlagElectric($scope.hitlag_modifier)), ShieldAdvantage(damage, hitlag, hitframe, faf, is_projectile, HitlagElectric($scope.hitlag_modifier), powershield)]));

        $scope.training = traininglist;
        $scope.vs = vslist;

    };

    $scope.update();
});



