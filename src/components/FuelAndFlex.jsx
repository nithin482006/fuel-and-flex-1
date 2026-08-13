import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { WaterTracker } from "@/components/WaterTracker";
import { useNavigate } from "@tanstack/react-router";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { useDailyNutrition } from "@/hooks/useDailyNutrition";
import { supabase } from "@/integrations/supabase/client";
import {
  Home, Dumbbell, Utensils, TrendingUp, Flame, Droplet, Moon, Check, Plus,
  X, ChevronLeft, ChevronRight, Clock, Sparkles, Info, RotateCcw,
  Pause, Play, SkipForward, Edit2, Trash2, Save, ChevronUp, ChevronDown, Zap,
  Trophy, Target, Weight,
} from "lucide-react";

/* ============================================================
   FUEL & FLEX v3 — Futuristic UI · Neon Green · Photo Fix
   ============================================================ */

/* Local cyberpunk exercise illustrations */
import imgBenchPress from "../assets/exercises/Barbell Bench Press.png";
import imgInclineDbPress from "../assets/exercises/Incline Dumbbell Press.png";
import imgPecDeck from "../assets/exercises/Pec Deck Fly.png";
import imgCableChestFly from "../assets/exercises/Cable Chest Fly.png";
import imgTricepsPushdown from "../assets/exercises/Triceps Pushdown.png";
import imgOhDbExt from "../assets/exercises/Overhead Dumbbell Extension.png";
import imgLatPulldown from "../assets/exercises/Lat Pulldown.png";
import imgSeatedCableRow from "../assets/exercises/Seated Cable Row.png";
import imgChestSupRow from "../assets/exercises/Chest Supported Row.png";
import imgStraightArm from "../assets/exercises/Straight Arm Pulldown.png";
import imgDbCurl from "../assets/exercises/Dumbbell Curl.png";
import imgHammerCurl from "../assets/exercises/Hammer Curl.png";
import imgBarbellSquat from "../assets/exercises/Barbell Squat.png";
import imgLegPress from "../assets/exercises/Leg Press.png";
import imgRDL from "../assets/exercises/Romanian Deadlift.png";
import imgLegExt from "../assets/exercises/Leg Extension.png";
import imgLegCurl from "../assets/exercises/Leg Curl.png";
import imgStandingCalf from "../assets/exercises/Standing Calf Raise.png";
import imgSeatedShoulder from "../assets/exercises/Seated Dumbbell Shoulder Press.png";
import imgLateralRaise from "../assets/exercises/Dumbbell Lateral Raise.png";
import imgRearDelt from "../assets/exercises/Rear Delt Fly.png";
import imgFacePull from "../assets/exercises/Face Pull.png";
import imgHangingKnee from "../assets/exercises/Hanging Knee Raise.png";
import imgPlank from "../assets/exercises/Plank.png";
import imgInclineBench from "../assets/exercises/Incline Bench Press.png";
import imgPullUp from "../assets/exercises/Pull-Up.png";
import imgMachineChest from "../assets/exercises/Machine Chest Press.png";
import imgCableRow from "../assets/exercises/Cable Row.png";
import imgEzBarCurl from "../assets/exercises/EZ Bar Curl.png";
import imgRopePushdown from "../assets/exercises/Rope Triceps Pushdown.png";
import imgFrontSquat from "../assets/exercises/Front Squat.png";
import imgWalkingLunges from "../assets/exercises/Walking Lunges.png";
import imgSeatedLegCurl from "../assets/exercises/Seated Leg Curl.png";
import imgSeatedCalf from "../assets/exercises/Seated Calf Raise.png";
import imgInclineDbCurl from "../assets/exercises/Incline Dumbbell Curl.png";
import imgSkullCrushers from "../assets/exercises/Skull Crushers.png";

const WK = (f, w = 500) =>
  `https://commons.wikimedia.org/w/index.php?title=Special:Redirect/file/${encodeURIComponent(f)}&width=${w}`;

const EX_IMG = {
  "Barbell Bench Press":             imgBenchPress,
  "Incline Dumbbell Press":          imgInclineDbPress,
  "Pec Deck Fly":                    imgPecDeck,
  "Cable Chest Fly":                 imgCableChestFly,
  "Triceps Pushdown":                imgTricepsPushdown,
  "Overhead Dumbbell Extension":     imgOhDbExt,
  "Rope Pushdown":                   imgRopePushdown,
  "Rope Triceps Pushdown":           imgRopePushdown,
  "Skull Crushers":                  imgSkullCrushers,
  "Lat Pulldown":                    imgLatPulldown,
  "Straight-Arm Pulldown":           imgStraightArm,
  "Straight Arm Pulldown":           imgStraightArm,
  "Seated Cable Row":                imgSeatedCableRow,
  "Chest-Supported Row":             imgChestSupRow,
  "Chest Supported Row":             imgChestSupRow,
  "Cable Row":                       imgCableRow,
  "Face Pull":                       imgFacePull,
  "Dumbbell Curl":                   imgDbCurl,
  "Hammer Curl":                     imgHammerCurl,
  "EZ Bar Curl":                     imgEzBarCurl,
  "Incline Dumbbell Curl":           imgInclineDbCurl,
  "Squat":                           imgBarbellSquat,
  "Barbell Squat":                   imgBarbellSquat,
  "Front Squat / Goblet Squat":      imgFrontSquat,
  "Front Squat":                     imgFrontSquat,
  "Leg Press":                       imgLegPress,
  "Leg Extension":                   imgLegExt,
  "Leg Curl":                        imgLegCurl,
  "Seated Leg Curl":                 imgSeatedLegCurl,
  "Seated Calf Raise":               imgSeatedCalf,
  "Standing Calf Raise":             imgStandingCalf,
  "Romanian Deadlift":               imgRDL,
  "Walking Lunges (per leg)":        imgWalkingLunges,
  "Walking Lunges":                  imgWalkingLunges,
  "Seated Dumbbell Shoulder Press":  imgSeatedShoulder,
  "Rear Delt Fly":                   imgRearDelt,
  "Lateral Raise":                   imgLateralRaise,
  "Dumbbell Lateral Raise":          imgLateralRaise,
  "Hanging Knee Raise":              imgHangingKnee,
  "Plank":                           imgPlank,
  "Incline Bench Press":             imgInclineBench,
  "Machine Chest Press":             imgMachineChest,
  "Pull-ups / Assisted Pull-ups":    imgPullUp,
  "Pull-Up":                         imgPullUp,
};

const DAY_COVER = {
  Monday:    imgBenchPress,
  Tuesday:   imgLatPulldown,
  Wednesday: imgBarbellSquat,
  Thursday:  imgSeatedShoulder,
  Friday:    imgPullUp,
  Saturday:  imgWalkingLunges,
  Sunday:    imgRDL,
};

const NUT_IMG = {
  pre:      WK("Banana-Single.jpg"),
  post:     WK("Protein_shake.jpg"),
  creatine: WK("Creatine_monohydrate_supplement.jpg"),
  water:    WK("Glass-of-water.jpg"),
};

const DAY_NEON = {
  Monday:"#00FF87", Tuesday:"#00E5FF", Wednesday:"#BAFF29",
  Thursday:"#BD93F9", Friday:"#FFD60A", Saturday:"#FF79C6", Sunday:"#6BFFB8",
};

const MUSCLE_GROUPS = [
  "Chest","Triceps","Back","Biceps","Quads","Hamstrings","Calves",
  "Glutes","Shoulders","Abs","Forearms","Upper Body","Lower Body","Full Body",
];

/* ── Default Program ─────────────────────────────────────────── */
const DEFAULT_SPLIT = {
  Monday:    { label:"Chest & Triceps", muscles:["Chest","Triceps"], exercises:[
    {name:"Barbell Bench Press",sets:4,repMin:8,repMax:10,rest:120},
    {name:"Incline Dumbbell Press",sets:3,repMin:10,repMax:12,rest:90},
    {name:"Pec Deck Fly",sets:3,repMin:12,repMax:15,rest:60},
    {name:"Cable Chest Fly",sets:2,repMin:12,repMax:15,rest:60},
    {name:"Triceps Pushdown",sets:3,repMin:10,repMax:12,rest:60},
    {name:"Overhead Dumbbell Extension",sets:3,repMin:12,repMax:12,rest:60},
  ]},
  Tuesday:   { label:"Back & Biceps", muscles:["Back","Biceps"], exercises:[
    {name:"Lat Pulldown",sets:4,repMin:8,repMax:10,rest:120},
    {name:"Seated Cable Row",sets:3,repMin:10,repMax:12,rest:90},
    {name:"Chest-Supported Row",sets:3,repMin:10,repMax:10,rest:90},
    {name:"Straight-Arm Pulldown",sets:3,repMin:12,repMax:15,rest:60},
    {name:"Dumbbell Curl",sets:3,repMin:10,repMax:12,rest:60},
    {name:"Hammer Curl",sets:3,repMin:12,repMax:12,rest:60},
  ]},
  Wednesday: { label:"Legs", muscles:["Quads","Hamstrings","Calves"], exercises:[
    {name:"Squat",sets:4,repMin:8,repMax:10,rest:150},
    {name:"Leg Press",sets:3,repMin:10,repMax:12,rest:120},
    {name:"Romanian Deadlift",sets:3,repMin:10,repMax:10,rest:120},
    {name:"Leg Extension",sets:3,repMin:12,repMax:15,rest:60},
    {name:"Leg Curl",sets:3,repMin:12,repMax:15,rest:60},
    {name:"Standing Calf Raise",sets:4,repMin:15,repMax:15,rest:45},
  ]},
  Thursday:  { label:"Shoulders & Abs", muscles:["Shoulders","Abs"], exercises:[
    {name:"Seated Dumbbell Shoulder Press",sets:4,repMin:8,repMax:10,rest:120},
    {name:"Lateral Raise",sets:4,repMin:12,repMax:15,rest:60},
    {name:"Rear Delt Fly",sets:3,repMin:12,repMax:15,rest:60},
    {name:"Face Pull",sets:3,repMin:15,repMax:15,rest:60},
    {name:"Hanging Knee Raise",sets:3,repMin:15,repMax:15,rest:45},
    {name:"Plank",sets:3,repMin:45,repMax:60,rest:45,unit:"sec"},
  ]},
  Friday:    { label:"Upper Body", muscles:["Chest","Back","Shoulders","Arms"], exercises:[
    {name:"Incline Bench Press",sets:3,repMin:8,repMax:10,rest:120},
    {name:"Pull-ups / Assisted Pull-ups",sets:3,repMin:8,repMax:10,rest:120},
    {name:"Machine Chest Press",sets:3,repMin:10,repMax:12,rest:90},
    {name:"Cable Row",sets:3,repMin:10,repMax:12,rest:90},
    {name:"Lateral Raise",sets:3,repMin:15,repMax:15,rest:60},
    {name:"EZ Bar Curl",sets:3,repMin:12,repMax:12,rest:60},
    {name:"Rope Pushdown",sets:3,repMin:12,repMax:12,rest:60},
  ]},
  Saturday:  { label:"Lower Body & Arms", muscles:["Legs","Biceps","Triceps"], exercises:[
    {name:"Front Squat / Goblet Squat",sets:3,repMin:10,repMax:10,rest:120},
    {name:"Walking Lunges (per leg)",sets:3,repMin:12,repMax:12,rest:90},
    {name:"Leg Curl",sets:3,repMin:12,repMax:12,rest:60},
    {name:"Seated Calf Raise",sets:4,repMin:15,repMax:15,rest:45},
    {name:"Incline Dumbbell Curl",sets:3,repMin:12,repMax:12,rest:60},
    {name:"Skull Crushers",sets:3,repMin:12,repMax:12,rest:60},
  ]},
  Sunday:    { label:"Rest & Recovery", muscles:[], exercises:[] },
};

const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const GOALS = {proteinMin:110,proteinMax:130,waterMin:3000,waterMax:4000,sleepMin:7.5,sleepMax:9};
const PRE_WORKOUT  = {label:"Pre-Workout Fuel",  items:"Banana · Black coffee · Peanut butter (opt.)",  proteinG:4};
const POST_WORKOUT = {label:"Post-Workout Refuel",items:"500 ml milk · 4 eggs or 1 scoop whey · Banana", proteinG:38};

/* ── Date helpers ────────────────────────────────────────────── */
const pad2       = n => String(n).padStart(2,"0");
const toKey      = d => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
const todayKey   = () => toKey(new Date());
const weekdayOf  = k => { const [y,m,d]=k.split("-").map(Number); return DAY_NAMES[new Date(y,m-1,d).getDay()]; };
const prettyDate = k => { const [y,m,d]=k.split("-").map(Number); return new Date(y,m-1,d).toLocaleDateString(undefined,{weekday:"long",month:"short",day:"numeric"}); };
const shiftKey   = (k,n) => { const [y,m,d]=k.split("-").map(Number); const dt=new Date(y,m-1,d); dt.setDate(dt.getDate()+n); return toKey(dt); };
const mondayOf   = k => { const [y,m,d]=k.split("-").map(Number); const dt=new Date(y,m-1,d); const dow=dt.getDay(); dt.setDate(dt.getDate()-(dow===0?6:dow-1)); return toKey(dt); };
const fmtClock   = s => `${Math.floor(s/60)}:${pad2(s%60)}`;

/* ── Storage ─────────────────────────────────────────────────── */
const STORE_KEY  = "fuel-flex-v3";
const EMPTY_DATA = {dailyLogs:{},workoutLogs:{},customSplit:{},onboardingDismissed:false};

async function loadData() {
  try {
    if (typeof window === "undefined") return {...EMPTY_DATA};
    const raw = window.localStorage.getItem(STORE_KEY);
    return raw ? {...EMPTY_DATA,...JSON.parse(raw)} : {...EMPTY_DATA};
  } catch { return {...EMPTY_DATA}; }
}
async function persist(data) {
  try { if (typeof window !== "undefined") window.localStorage.setItem(STORE_KEY,JSON.stringify(data)); }
  catch(e) { console.error(e); }
}

const getDailyLog   = (d,k) => d.dailyLogs[k]  || {creatine:false,proteinG:0,waterMl:0,sleepHours:null,mealsLogged:{pre:false,post:false}};
const getWorkoutLog = (d,k) => d.workoutLogs[k] || {exercises:{}};
const isDayComplete = l => !!l.creatine && l.proteinG>=GOALS.proteinMin && l.waterMl>=GOALS.waterMin && l.sleepHours!=null && l.sleepHours>=GOALS.sleepMin;
const getDayData    = (d,wd) => d.customSplit?.[wd] ?? DEFAULT_SPLIT[wd] ?? {label:"Workout",muscles:[],exercises:[]};

function buildHistory(data,name) {
  return Object.keys(data.workoutLogs).sort().map(date => {
    const ex = data.workoutLogs[date]?.exercises?.[name];
    if (!ex?.sets?.length) return null;
    const weighted = ex.sets.filter(s=>s.weight!=null);
    if (!weighted.length) return null;
    return {date, topWeight:Math.max(...weighted.map(s=>s.weight))};
  }).filter(Boolean).slice(-12);
}

/* ════════════════════════════════════════════════════════════
   STYLES — Futuristic Neon Green Dark Theme
   ════════════════════════════════════════════════════════════ */
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

/* All brand values come from the shared tokens in src/styles.css. */
:root {
  --bg:        var(--ff-bg);
  --bg2:       var(--ff-bg2);
  --surf:      var(--ff-surf);
  --surf2:     var(--ff-surf2);
  --surf3:     var(--ff-surf3);
  --bdr:       var(--ff-bdr);
  --bdr2:      var(--ff-bdr2);
  --bdr3:      var(--ff-bdr3);
  --neon:      var(--ff-neon);
  --neon-dim:  var(--ff-neon-dim);
  --glow:      rgba(0,255,135,0.20);
  --glow-lg:   rgba(0,255,135,0.10);
  --cyan:      #00E5FF;
  --purple:    #BD93F9;
  --yellow:    #FFD60A;
  --danger:    var(--ff-danger);
  --text:      var(--ff-text);
  --text-2:    var(--ff-text-2);
  --text-3:    var(--ff-text-3);
  --font-d:    var(--ff-font-display);
  --font-b:    var(--ff-font-body);
  --font-m:    var(--ff-font-mono);
}

.ff-root {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-b);
  min-height: 100vh;
  display: flex;
  justify-content: center;
}
.ff-root * { box-sizing: border-box; margin:0; padding:0; }

.ff-shell {
  width: 100%;
  max-width: 460px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
  position: relative;
  overflow: hidden;
}

/* ── Scrollable body ──────────────────────────────── */
.ff-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 14px 14px 92px;
  scrollbar-width: none;
}
.ff-scroll::-webkit-scrollbar { display: none; }

/* ── Header ───────────────────────────────────────── */
.ff-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 14px;
  background: rgba(6,10,8,0.96);
  border-bottom: 1px solid var(--bdr2);
  position: sticky;
  top: 0;
  z-index: 20;
  backdrop-filter: blur(12px);
}
.ff-header::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, var(--neon), transparent);
  opacity: 0.25;
}
.ff-logo {
  font-family: var(--font-d);
  font-weight: 700;
  font-size: 17px;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--text);
}
.ff-logo .bolt {
  color: var(--neon);
  filter: drop-shadow(0 0 6px var(--neon));
}
.ff-date-block { text-align: right; }
.ff-date-block .day  { font-family:var(--font-d); font-size:11px; color:var(--neon); letter-spacing:1.5px; text-transform:uppercase; }
.ff-date-block .date { font-family:var(--font-m); font-size:10px; color:var(--text-2); margin-top:1px; }

/* ── Bottom nav ───────────────────────────────────── */
.ff-nav {
  position: sticky;
  bottom: 0;
  display: flex;
  background: rgba(8,14,11,0.97);
  border-top: 1px solid var(--bdr2);
  backdrop-filter: blur(16px);
}
.ff-nav::before {
  content:'';
  position:absolute;
  top:0; left:0; right:0; height:1px;
  background: linear-gradient(90deg, transparent, var(--neon), transparent);
  opacity:0.2;
}
.ff-nav button {
  flex: 1;
  background: none;
  border: none;
  color: var(--text-3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 11px 0 14px;
  font-family: var(--font-b);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: color 0.2s, filter 0.2s;
}
.ff-nav button.active {
  color: var(--neon);
  filter: drop-shadow(0 0 5px var(--neon));
}

/* ── Cards ────────────────────────────────────────── */
.card {
  background: linear-gradient(160deg, var(--surf) 0%, var(--bg2) 100%);
  border: 1px solid var(--bdr);
  border-top-color: var(--bdr2);
  border-radius: 14px;
  padding: 15px;
  margin-bottom: 12px;
  box-shadow:
    0 0 0 1px rgba(0,255,135,0.03),
    0 6px 28px rgba(0,0,0,0.55),
    inset 0 1px 0 rgba(0,255,135,0.06);
}
.card-photo { padding: 0; overflow: hidden; }
.card-body  { padding: 13px 14px 14px; }
.card-label {
  font-family: var(--font-d);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--text-2);
  margin-bottom: 11px;
}

/* ── Neon glow card variant ───────────────────────── */
.card-glow {
  border-color: var(--bdr3);
  box-shadow:
    0 0 16px rgba(0,255,135,0.08),
    0 6px 28px rgba(0,0,0,0.55),
    inset 0 1px 0 rgba(0,255,135,0.12);
}

/* ── Buttons ──────────────────────────────────────── */
.btn {
  font-family: var(--font-b);
  font-weight: 600;
  border-radius: 9px;
  border: 1px solid var(--bdr2);
  background: var(--surf2);
  color: var(--text);
  padding: 10px 14px;
  cursor: pointer;
  font-size: 13px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: all 0.15s;
}
.btn:active { transform: scale(0.96); }
.btn-neon {
  background: var(--neon);
  border-color: var(--neon);
  color: #040F07;
  font-weight: 700;
  box-shadow: 0 0 18px rgba(0,255,135,0.35), 0 0 40px rgba(0,255,135,0.12);
}
.btn-neon:hover { box-shadow: 0 0 24px rgba(0,255,135,0.55), 0 0 50px rgba(0,255,135,0.18); }
.btn-ghost  { background: transparent; border-color: transparent; }
.btn-danger { background: rgba(255,83,112,0.1); border-color: rgba(255,83,112,0.3); color: var(--danger); }
.btn-success { background: rgba(0,255,135,0.08); border-color: var(--bdr3); color: var(--neon); }
.btn-sm     { padding: 6px 10px; font-size: 12px; border-radius: 8px; }
.btn-icon   { padding: 7px; border-radius: 9px; }

/* ── Inputs ───────────────────────────────────────── */
input[type="number"], input[type="text"], select {
  font-family: var(--font-m);
  background: var(--surf2);
  border: 1px solid var(--bdr2);
  border-radius: 9px;
  color: var(--text);
  padding: 9px 11px;
  font-size: 13px;
  width: 100%;
  transition: border-color 0.2s, box-shadow 0.2s;
}
input:focus, select:focus {
  outline: none;
  border-color: var(--neon);
  box-shadow: 0 0 0 2px rgba(0,255,135,0.12);
}
input::-webkit-inner-spin-button,
input::-webkit-outer-spin-button { -webkit-appearance: none; }
select { appearance: none; cursor: pointer; }
select option { background: var(--surf2); }

/* ── Progress bars ────────────────────────────────── */
.prog-track {
  height: 8px;
  border-radius: 99px;
  background: var(--surf3);
  overflow: hidden;
  position: relative;
}
.prog-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s cubic-bezier(0.34,1.56,0.64,1);
  position: relative;
}
.prog-fill::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%);
  animation: shimmer 2.5s infinite;
}
@keyframes shimmer {
  from { transform: translateX(-100%); }
  to   { transform: translateX(200%); }
}

/* ── Checklist rows ───────────────────────────────── */
.cl-row {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 0;
  border-top: 1px solid var(--bdr);
  cursor: pointer;
  transition: opacity 0.15s;
}
.cl-row:active { opacity: 0.75; }
.cl-check {
  width: 27px; height: 27px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1.5px solid var(--bdr2);
  background: var(--surf2);
  transition: all 0.25s;
}
.cl-check.done {
  background: var(--neon);
  border-color: var(--neon);
  box-shadow: 0 0 12px rgba(0,255,135,0.5), 0 0 24px rgba(0,255,135,0.2);
}

/* ── Streak badge ─────────────────────────────────── */
.streak-badge {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(0,255,135,0.08);
  border: 1px solid var(--bdr3);
  border-radius: 99px;
  padding: 4px 11px;
  box-shadow: 0 0 12px rgba(0,255,135,0.08);
}

/* ── Pill ─────────────────────────────────────────── */
.pill {
  font-family: var(--font-m);
  font-size: 11px;
  padding: 3px 9px;
  border-radius: 99px;
  background: var(--surf3);
  border: 1px solid var(--bdr);
  color: var(--text-2);
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}

/* ── Muscle tag ───────────────────────────────────── */
.muscle-tag {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.5px;
  padding: 2px 8px;
  border-radius: 99px;
  white-space: nowrap;
  font-family: var(--font-b);
}

/* ── Set row ──────────────────────────────────────── */
.set-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-m);
  font-size: 12px;
  padding: 5px 0;
  border-bottom: 1px solid var(--bdr);
  color: var(--text-2);
}
.set-row:last-child { border-bottom: none; }

/* ── Rest timer ───────────────────────────────────── */
.rest-card {
  background: linear-gradient(135deg, rgba(0,255,135,0.07) 0%, rgba(0,20,12,0.95) 100%);
  border: 1px solid var(--bdr3);
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 12px;
  position: sticky;
  top: 58px;
  z-index: 9;
  box-shadow: 0 0 24px rgba(0,255,135,0.12);
}
@keyframes pulse-glow {
  0%,100% { box-shadow: 0 0 24px rgba(0,255,135,0.12); }
  50%      { box-shadow: 0 0 36px rgba(0,255,135,0.25); }
}
.rest-card.running { animation: pulse-glow 2s ease-in-out infinite; }

/* ── Overload banner ──────────────────────────────── */
.overload {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: rgba(0,255,135,0.06);
  border: 1px solid var(--bdr3);
  border-radius: 10px;
  padding: 9px 11px;
  margin-top: 11px;
}

/* ── Editor modal ─────────────────────────────────── */
.modal-wrap {
  position: absolute;
  inset: 0;
  z-index: 50;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 13px;
  background: var(--surf);
  border-bottom: 1px solid var(--bdr2);
  position: sticky;
  top: 0;
  z-index: 2;
}
.modal-scroll { flex: 1; overflow-y: auto; padding: 14px; scrollbar-width: none; }
.modal-scroll::-webkit-scrollbar { display: none; }
.modal-foot {
  padding: 12px 14px;
  background: var(--surf);
  border-top: 1px solid var(--bdr2);
}

/* ── Editor exercise row ──────────────────────────── */
.ex-row {
  display: flex;
  align-items: center;
  gap: 9px;
  background: var(--surf2);
  border: 1px solid var(--bdr);
  border-radius: 11px;
  padding: 10px 11px;
  margin-bottom: 8px;
  transition: border-color 0.2s;
}
.ex-row:hover { border-color: var(--bdr2); }
.ex-thumb {
  width: 44px; height: 44px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--surf3);
  position: relative;
}
.ex-thumb img { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }

/* ── Day pill ─────────────────────────────────────── */
.day-pill {
  font-family: var(--font-d);
  font-size: 11px;
  letter-spacing: 0.5px;
  padding: 5px 12px;
  border-radius: 99px;
  cursor: pointer;
  border: 1px solid var(--bdr2);
  background: var(--surf2);
  color: var(--text-2);
  transition: all 0.15s;
  white-space: nowrap;
}

/* ── Stat cell ────────────────────────────────────── */
.stat-cell {
  background: var(--surf2);
  border: 1px solid var(--bdr);
  border-radius: 12px;
  padding: 13px 14px;
}

/* ── Misc ─────────────────────────────────────────── */
hr.div { border:none; border-top: 1px solid var(--bdr); margin: 12px 0; }
::selection { background: var(--neon); color: #040F07; }
`;

/* ══════════════════════════════════════════════════════════════
   PHOTO BANNER — two-level fallback: exercise photo → day cover
   ══════════════════════════════════════════════════════════════ */
function PhotoBanner({src, fallbackSrc, height=160, alt="", neon="#00FF87", children}) {
  const [triedFallback, setTriedFallback] = useState(false);
  const [noImg, setNoImg]                  = useState(!src && !fallbackSrc);
  const imgRef = useRef(null);

  /* reset when primary src changes (new day / new exercise) */
  useEffect(() => {
    setTriedFallback(false);
    setNoImg(!src && !fallbackSrc);
  }, [src]);

  const activeSrc = triedFallback ? fallbackSrc : src;

  const handleError = () => {
    if (!triedFallback && fallbackSrc && fallbackSrc !== src) {
      setTriedFallback(true);
    } else {
      setNoImg(true);
    }
  };

  return (
    <div style={{
      position:"relative", height, overflow:"hidden",
      background: noImg
        ? `linear-gradient(160deg, rgba(0,255,135,0.04) 0%, var(--bg) 100%)`
        : "var(--bg)",
    }}>
      {/* Scan-line top accent */}
      <div style={{position:"absolute",top:0,left:0,right:0,height:1,
        background:`linear-gradient(90deg,transparent,${neon}50,transparent)`,zIndex:2}}/>

      {!noImg && activeSrc && (
        <img
          ref={imgRef}
          key={activeSrc}
          src={activeSrc}
          alt={alt}
          onError={handleError}
          style={{position:"absolute",inset:0,width:"100%",height:"100%",
            objectFit:"cover",opacity:0.6,transition:"opacity 0.3s"}}
        />
      )}

      {/* Dark gradient overlay – always present */}
      <div style={{position:"absolute",inset:0,
        background:"linear-gradient(to top, rgba(6,10,8,1) 0%, rgba(6,10,8,0.65) 48%, rgba(6,10,8,0.15) 100%)"}}/>

      {/* Content slot */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"12px 14px"}}>
        {children}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PLATE LOADER
   ══════════════════════════════════════════════════════════════ */
function PlateLoader({items}) {
  const cx=230, sW=30, pW=12, pG=7;
  const pH=[42,35,27,20];
  return (
    <svg viewBox="0 0 460 78" width="100%" height="78" style={{display:"block",margin:"4px 0 6px"}}>
      <line x1="18" y1="39" x2="442" y2="39" stroke="rgba(0,255,135,0.12)" strokeWidth="5" strokeLinecap="round"/>
      <rect x={cx-sW/2} y="25" width={sW} height="28" rx="4" fill="rgba(0,255,135,0.15)"
        style={{filter:"drop-shadow(0 0 4px rgba(0,255,135,0.3))"}}/>
      {items.map((it,i) => {
        const h=pH[i]||16;
        const off=sW/2+i*(pW+pG)+pG;
        return (
          <g key={i} style={{transition:"all 0.4s ease"}}>
            <rect x={cx-off-pW} y={39-h/2} width={pW} height={h} rx="3"
              fill={it.done?it.color:"rgba(0,255,135,0.06)"}
              stroke={it.done?it.color:"rgba(0,255,135,0.15)"}
              strokeWidth="1"
              opacity={it.done?1:0.5}
              style={it.done?{filter:`drop-shadow(0 0 5px ${it.color})`}:{}}/>
            <rect x={cx+off} y={39-h/2} width={pW} height={h} rx="3"
              fill={it.done?it.color:"rgba(0,255,135,0.06)"}
              stroke={it.done?it.color:"rgba(0,255,135,0.15)"}
              strokeWidth="1"
              opacity={it.done?1:0.5}
              style={it.done?{filter:`drop-shadow(0 0 5px ${it.color})`}:{}}/>
          </g>
        );
      })}
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════
   HEADER + NAV
   ══════════════════════════════════════════════════════════════ */
function Header() {
  const now = new Date();
  const wd  = DAY_NAMES[now.getDay()];
  const dt  = now.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});
  return (
    <div className="ff-header">
      <div className="ff-logo"><Zap size={18} className="bolt" style={{color:"var(--neon)",filter:"drop-shadow(0 0 6px var(--neon))"}}/> FUEL &amp; FLEX</div>
      <div className="ff-date-block">
        <div className="day">{wd}</div>
        <div className="date">{dt}</div>
      </div>
    </div>
  );
}

function BottomNav({tab,setTab}) {
  const tabs=[
    {id:"dashboard",label:"TODAY",   icon:Home},
    {id:"workout",  label:"WORKOUT", icon:Dumbbell},
    {id:"nutrition",label:"FUEL",    icon:Utensils},
    {id:"progress", label:"STATS",   icon:TrendingUp},
  ];
  return (
    <div className="ff-nav">
      {tabs.map(({id,label,icon:Icon})=>(
        <button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}>
          <Icon size={20} strokeWidth={tab===id?2.5:1.8}/>
          {label}
        </button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   WORKOUT EDITOR MODAL
   ══════════════════════════════════════════════════════════════ */
function WorkoutEditorModal({data, weekday, onSave, onClose}) {
  const base = getDayData(data, weekday);
  const neon = DAY_NEON[weekday];

  const [label,    setLabel]    = useState(base.label || weekday);
  const [muscles,  setMuscles]  = useState(base.muscles || []);
  const [exList,   setExList]   = useState((base.exercises||[]).map((e,i)=>({...e,_id:i+Date.now()})));
  const [musInput, setMusInput] = useState("");

  const [nName,setNName]=useState(""); const [nSets,setNSets]=useState("3");
  const [nRMin,setNRMin]=useState("8"); const [nRMax,setNRMax]=useState("12");
  const [nRest,setNRest]=useState("60"); const [nUnit,setNUnit]=useState("reps");

  const toggleMuscle = m => setMuscles(p=>p.includes(m)?p.filter(x=>x!==m):[...p,m]);
  const addMuscle    = () => { const v=musInput.trim(); if(v&&!muscles.includes(v)) setMuscles(p=>[...p,v]); setMusInput(""); };
  const removeEx     = id => setExList(p=>p.filter(e=>e._id!==id));
  const moveEx = (id,dir) => setExList(p=>{
    const i=p.findIndex(e=>e._id===id), n=[...p], t=i+dir;
    if(t<0||t>=n.length) return p;
    [n[i],n[t]]=[n[t],n[i]]; return n;
  });
  const addEx = () => {
    if(!nName.trim()) return;
    setExList(p=>[...p,{name:nName.trim(),sets:+nSets||3,repMin:+nRMin||8,repMax:+nRMax||12,rest:+nRest||60,unit:nUnit==="sec"?"sec":undefined,_id:Date.now()+Math.random()}]);
    setNName(""); setNSets("3"); setNRMin("8"); setNRMax("12"); setNRest("60"); setNUnit("reps");
  };
  const save = () => { onSave(weekday,{label,muscles,exercises:exList.map(({_id,...r})=>r)}); onClose(); };
  const reset = () => {
    const def=DEFAULT_SPLIT[weekday]||{label:weekday,muscles:[],exercises:[]};
    setLabel(def.label); setMuscles(def.muscles||[]);
    setExList((def.exercises||[]).map((e,i)=>({...e,_id:i+Date.now()})));
  };

  return (
    <div className="modal-wrap">
      <div className="modal-head">
        <div>
          <div style={{fontFamily:"var(--font-d)",fontSize:14,fontWeight:700,color:neon,letterSpacing:"1.5px",
            textShadow:`0 0 10px ${neon}60`}}>
            EDIT · {weekday.toUpperCase()}
          </div>
          <div style={{fontSize:11,color:"var(--text-2)",marginTop:2}}>Customise exercises &amp; muscle groups</div>
        </div>
        <div style={{display:"flex",gap:7}}>
          <button className="btn btn-ghost btn-sm" onClick={reset} style={{color:"var(--text-2)",fontSize:11}}>
            <RotateCcw size={12}/> Reset
          </button>
          <button className="btn btn-icon btn-ghost" onClick={onClose}><X size={18}/></button>
        </div>
      </div>

      <div className="modal-scroll">
        {/* Day label */}
        <div style={{marginBottom:14}}>
          <div className="card-label">Day Label</div>
          <input type="text" value={label} onChange={e=>setLabel(e.target.value)} placeholder="e.g. Chest & Triceps"/>
        </div>

        {/* Muscle groups */}
        <div style={{marginBottom:16}}>
          <div className="card-label">Muscle Groups Targeted</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
            {MUSCLE_GROUPS.map(m=>(
              <div key={m} className="day-pill"
                style={muscles.includes(m)?{background:neon,borderColor:neon,color:"#040F07",fontWeight:700}:{}}
                onClick={()=>toggleMuscle(m)}>{m}</div>
            ))}
          </div>
          {muscles.length>0&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
              {muscles.map(m=>(
                <span key={m} style={{display:"inline-flex",alignItems:"center",gap:5,fontSize:11,
                  padding:"3px 9px",borderRadius:99,background:`${neon}15`,border:`1px solid ${neon}40`,color:neon}}>
                  {m}
                  <span onClick={()=>toggleMuscle(m)} style={{cursor:"pointer",opacity:0.6,lineHeight:1}}>×</span>
                </span>
              ))}
            </div>
          )}
          <div style={{display:"flex",gap:8}}>
            <input type="text" value={musInput} onChange={e=>setMusInput(e.target.value)}
              placeholder="Add custom muscle group…" style={{flex:1}}
              onKeyDown={e=>e.key==="Enter"&&addMuscle()}/>
            <button className="btn btn-sm" onClick={addMuscle}><Plus size={13}/> Add</button>
          </div>
        </div>

        <hr className="div"/>

        {/* Exercise list */}
        <div style={{marginBottom:10}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:11}}>
            <div className="card-label" style={{marginBottom:0}}>{exList.length} Exercises</div>
            <span style={{fontSize:10,color:"var(--text-3)",fontFamily:"var(--font-m)"}}>↑↓ reorder</span>
          </div>

          {exList.length===0&&(
            <div style={{textAlign:"center",padding:"20px 0",color:"var(--text-3)",fontSize:12,fontFamily:"var(--font-m)"}}>
              No exercises — add one below ↓
            </div>
          )}

          {exList.map((ex,idx)=>{
            const src=EX_IMG[ex.name];
            return (
              <div key={ex._id} className="ex-row">
                <div className="ex-thumb">
                  {src&&<img src={src} alt={ex.name} onError={e=>{e.target.style.display="none";}}/>}
                  {!src&&<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",
                    justifyContent:"center",background:"var(--surf3)"}}><Dumbbell size={15} color={neon}/></div>}
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ex.name}</div>
                  <div style={{fontFamily:"var(--font-m)",fontSize:11,color:"var(--text-2)",marginTop:2}}>
                    {ex.sets}× {ex.repMin===ex.repMax?ex.repMin:`${ex.repMin}–${ex.repMax}`}{ex.unit==="sec"?"s":""} · {fmtClock(ex.rest)}
                  </div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:2}}>
                  <button className="btn btn-ghost btn-sm" onClick={()=>moveEx(ex._id,-1)} disabled={idx===0}
                    style={{padding:2,opacity:idx===0?0.2:0.7}}><ChevronUp size={14}/></button>
                  <button className="btn btn-ghost btn-sm" onClick={()=>moveEx(ex._id,1)} disabled={idx===exList.length-1}
                    style={{padding:2,opacity:idx===exList.length-1?0.2:0.7}}><ChevronDown size={14}/></button>
                </div>
                <button className="btn btn-danger btn-icon btn-sm" onClick={()=>removeEx(ex._id)} style={{padding:6}}>
                  <Trash2 size={13}/>
                </button>
              </div>
            );
          })}
        </div>

        <hr className="div"/>

        {/* Add exercise form */}
        <div>
          <div className="card-label" style={{marginBottom:12}}>Add New Exercise</div>
          <input type="text" value={nName} onChange={e=>setNName(e.target.value)}
            placeholder="Exercise name (e.g. Dumbbell Row)"
            style={{marginBottom:10}}
            onKeyDown={e=>e.key==="Enter"&&addEx()}/>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
            <div>
              <div style={{fontSize:10,color:"var(--text-2)",fontFamily:"var(--font-m)",marginBottom:4}}>Sets</div>
              <input type="number" value={nSets} onChange={e=>setNSets(e.target.value)}/>
            </div>
            <div>
              <div style={{fontSize:10,color:"var(--text-2)",fontFamily:"var(--font-m)",marginBottom:4}}>Rep Min</div>
              <input type="number" value={nRMin} onChange={e=>setNRMin(e.target.value)}/>
            </div>
            <div>
              <div style={{fontSize:10,color:"var(--text-2)",fontFamily:"var(--font-m)",marginBottom:4}}>Rep Max</div>
              <input type="number" value={nRMax} onChange={e=>setNRMax(e.target.value)}/>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:13}}>
            <div>
              <div style={{fontSize:10,color:"var(--text-2)",fontFamily:"var(--font-m)",marginBottom:4}}>Rest (sec)</div>
              <input type="number" value={nRest} onChange={e=>setNRest(e.target.value)}/>
            </div>
            <div>
              <div style={{fontSize:10,color:"var(--text-2)",fontFamily:"var(--font-m)",marginBottom:4}}>Unit</div>
              <select value={nUnit} onChange={e=>setNUnit(e.target.value)}>
                <option value="reps">Reps</option>
                <option value="sec">Seconds (e.g. Plank)</option>
              </select>
            </div>
          </div>
          <button className="btn btn-neon" style={{width:"100%",justifyContent:"center"}} onClick={addEx}>
            <Plus size={16}/> Add to {weekday}
          </button>
        </div>
      </div>

      <div className="modal-foot">
        <button className="btn btn-success" style={{width:"100%",justifyContent:"center",padding:"12px",fontSize:14}} onClick={save}>
          <Save size={15}/> Save Workout Plan
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   REST TIMER
   ══════════════════════════════════════════════════════════════ */
function RestTimer({timer, onToggle, onSkip}) {
  if (!timer) return null;
  const pct = Math.max(0,(1-timer.remaining/timer.total)*100);
  const done = timer.remaining===0;
  return (
    <div className={`rest-card ${timer.running&&!done?"running":""}`}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontFamily:"var(--font-d)",fontSize:9,letterSpacing:"2px",
            color:done?"var(--neon)":"var(--text-2)",marginBottom:4}}>
            {done?"READY — LET'S GO! 💪":"RECOVERING — BREATHE DEEP"}
          </div>
          <div style={{fontFamily:"var(--font-m)",fontWeight:700,fontSize:34,letterSpacing:"-1px",
            color:done?"var(--neon)":"var(--text)",
            textShadow:done?"0 0 16px var(--neon)":"none",
            transition:"color 0.4s,text-shadow 0.4s"}}>
            {fmtClock(Math.max(0,timer.remaining))}
          </div>
          <div style={{fontSize:11,color:"var(--text-2)",marginTop:2}}>
            after: <span style={{color:"var(--text)",fontWeight:600}}>{timer.label}</span>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button className="btn btn-sm" onClick={onToggle}>
            {timer.running?<Pause size={16}/>:<Play size={16}/>}
          </button>
          <button className="btn btn-sm" onClick={onSkip}><SkipForward size={16}/></button>
        </div>
      </div>
      <div className="prog-track" style={{marginTop:11,height:5}}>
        <div className="prog-fill" style={{width:`${pct}%`,
          background:done?"var(--neon)":"linear-gradient(90deg,var(--neon-dim),var(--neon))",
          boxShadow:done?"0 0 8px var(--neon)":"0 0 6px var(--neon)"}}/>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   EXERCISE CARD — with photo + two-level fallback
   ══════════════════════════════════════════════════════════════ */
function ExerciseCard({ex, loggedSets, onLogSet, history, neon, dayCover, isToday}) {
  const [weight,setWeight]=useState(""); const [reps,setReps]=useState(""); const [rir,setRir]=useState("");
  const [showHist,setShowHist]=useState(false);
  const unit = ex.unit==="sec"?"sec":"reps";
  const chartData=(history||[]).map(h=>({date:h.date.slice(5),weight:h.topWeight}));
  const allDone = loggedSets.length>=ex.sets && loggedSets.every(s=>Number(s.reps)>=ex.repMax);
  const submit = () => {
    if(!reps) return;
    onLogSet({weight:weight?Number(weight):null,reps:Number(reps),rir:rir?Number(rir):null});
    setReps(""); setRir("");
  };

  return (
    <div className="card card-photo" style={{border:`1px solid ${neon}18`}}>

      {/* ── Photo with fallback to day cover ── */}
      <PhotoBanner
        src={EX_IMG[ex.name]}
        fallbackSrc={dayCover}
        height={160}
        alt={ex.name}
        neon={neon}
      >
        {history&&history.length>0&&(
          <button onClick={()=>setShowHist(v=>!v)} style={{
            position:"absolute",top:10,right:10,
            background:"rgba(6,10,8,0.75)",border:`1px solid ${neon}40`,
            borderRadius:8,color:neon,padding:"4px 9px",
            display:"flex",alignItems:"center",gap:4,
            fontSize:11,cursor:"pointer",fontFamily:"var(--font-b)",fontWeight:600,
            backdropFilter:"blur(6px)",
          }}>
            <TrendingUp size={11}/> {showHist?"Hide":"History"}
          </button>
        )}
        {/* Exercise name + pills overlaid on photo */}
        <div style={{fontFamily:"var(--font-d)",fontSize:15,fontWeight:700,
          color:"var(--text)",letterSpacing:"0.5px",
          textShadow:"0 1px 8px rgba(0,0,0,0.9)",marginBottom:7}}>
          {ex.name}
        </div>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
          <span className="pill" style={{background:`${neon}18`,borderColor:`${neon}40`,color:neon}}>
            {ex.sets}×{ex.repMin===ex.repMax?ex.repMin:`${ex.repMin}–${ex.repMax}`}{unit==="sec"?"s":""}
          </span>
          <span className="pill"><Clock size={10}/>{fmtClock(ex.rest)} rest</span>
        </div>
      </PhotoBanner>

      <div className="card-body">
        {/* History mini-chart */}
        {showHist&&chartData.length>0&&(
          <div style={{height:95,marginBottom:12}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid stroke="rgba(0,255,135,0.06)" strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="date" tick={{fontSize:9,fill:"var(--text-2)"}} axisLine={{stroke:"var(--bdr)"}} tickLine={false}/>
                <YAxis tick={{fontSize:9,fill:"var(--text-2)"}} axisLine={false} tickLine={false} width={28}/>
                <Tooltip contentStyle={{background:"var(--surf)",border:"1px solid var(--bdr2)",fontSize:11,borderRadius:9}}/>
                <Line type="monotone" dataKey="weight" stroke={neon} strokeWidth={2} dot={{r:2,fill:neon}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Logged sets */}
        {loggedSets.length>0&&(
          <div style={{marginBottom:10}}>
            {loggedSets.map((s,i)=>(
              <div key={i} className="set-row">
                <span style={{color:neon,fontWeight:700,fontFamily:"var(--font-d)",fontSize:10,letterSpacing:"0.5px"}}>
                  SET {i+1}
                </span>
                <span>{s.weight!=null?`${s.weight} kg × `:""}{s.reps}{unit==="sec"?"s":""}{s.rir!=null?` · RIR ${s.rir}`:""}</span>
              </div>
            ))}
          </div>
        )}

        {/* Beginner hint when no sets yet */}
        {loggedSets.length===0&&isToday&&(
          <div style={{padding:"8px 0 4px",fontSize:12,color:"var(--text-3)",fontFamily:"var(--font-m)"}}>
            → Tap + to log your first set for this exercise
          </div>
        )}

        {/* Overload banner */}
        {allDone&&(
          <div className="overload">
            <Sparkles size={14} color={neon} style={{flexShrink:0,marginTop:1}}/>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:neon}}>Level Up Time! 🏋️</div>
              <div style={{fontSize:11,color:"var(--text-2)",marginTop:2}}>
                You've nailed every set at the max rep range. Next session, add 2.5–5 kg.
              </div>
            </div>
          </div>
        )}

        {/* Log inputs */}
        {isToday&&(
          <div style={{display:"grid",gridTemplateColumns:unit==="sec"?"1fr auto":"1fr 1fr 1fr auto",gap:7,marginTop:12}}>
            {unit!=="sec"&&<input type="number" inputMode="decimal" placeholder="kg" value={weight} onChange={e=>setWeight(e.target.value)}/>}
            <input type="number" inputMode="numeric" placeholder={unit==="sec"?"sec":"reps"} value={reps} onChange={e=>setReps(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
            {unit!=="sec"&&<input type="number" inputMode="numeric" placeholder="RIR 0-3" value={rir} onChange={e=>setRir(e.target.value)}/>}
            <button className="btn btn-neon" onClick={submit}
              style={{padding:0,minWidth:42,height:43,borderRadius:9,justifyContent:"center",fontSize:0}}>
              <Plus size={19}/>
            </button>
          </div>
        )}
        {!isToday&&(
          <div style={{marginTop:10,fontSize:11,color:"var(--text-3)",fontFamily:"var(--font-m)",textAlign:"center"}}>
            Browse mode · go to today to log sets
          </div>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   WORKOUT TAB
   ══════════════════════════════════════════════════════════════ */
function WorkoutTab({data, dateKey, setDateKey, logSet, exerciseHistory, onOpenEditor}) {
  const weekday = weekdayOf(dateKey);
  const dayData = getDayData(data, weekday);
  const wlog    = getWorkoutLog(data, dateKey);
  const isToday = dateKey===todayKey();
  const neon    = DAY_NEON[weekday];
  const cover   = DAY_COVER[weekday];

  const [timer, setTimer] = useState(null);
  const ivRef = useRef(null);

  useEffect(()=>{
    if(timer?.running){
      ivRef.current=setInterval(()=>{
        setTimer(t=>{
          if(!t) return t;
          if(t.remaining<=1) return{...t,remaining:0,running:false};
          return{...t,remaining:t.remaining-1};
        });
      },1000);
      return ()=>clearInterval(ivRef.current);
    }
  },[timer?.running]);

  const startTimer=(sec,label)=>setTimer({label,total:sec,remaining:sec,running:true});

  const setsLogged = Object.values(wlog.exercises||{}).reduce((n,e)=>n+(e.sets?.length||0),0);

  return (
    <>
      {/* Day hero */}
      <div className="card card-photo" style={{marginBottom:12,border:`1px solid ${neon}20`}}>
        <PhotoBanner src={cover} fallbackSrc={cover} height={195} alt={weekday} neon={neon}>
          <div style={{position:"absolute",top:12,right:12,display:"flex",gap:7}}>
            <button onClick={onOpenEditor} style={{
              background:"rgba(6,10,8,0.75)",border:`1px solid ${neon}50`,borderRadius:9,
              color:neon,padding:"6px 11px",display:"flex",alignItems:"center",gap:5,
              fontSize:11,cursor:"pointer",fontWeight:600,fontFamily:"var(--font-b)",
              backdropFilter:"blur(6px)",
            }}>
              <Edit2 size={11}/> Edit Day
            </button>
          </div>
          <div style={{position:"absolute",top:"50%",left:10,transform:"translateY(-50%)"}}>
            <button onClick={()=>setDateKey(shiftKey(dateKey,-1))}
              className="btn btn-icon" style={{background:"rgba(6,10,8,0.6)",border:`1px solid ${neon}30`}}>
              <ChevronLeft size={18}/>
            </button>
          </div>
          <div style={{position:"absolute",top:"50%",right:10,transform:"translateY(-50%)"}}>
            <button onClick={()=>setDateKey(shiftKey(dateKey,1))}
              className="btn btn-icon" style={{background:"rgba(6,10,8,0.6)",border:`1px solid ${neon}30`}}>
              <ChevronRight size={18}/>
            </button>
          </div>

          <div style={{fontFamily:"var(--font-d)",fontSize:9,color:neon,letterSpacing:"2.5px",
            textTransform:"uppercase",marginBottom:5,
            textShadow:`0 0 8px ${neon}80`}}>
            {isToday?"Today's Session":"Preview"}
          </div>
          <div style={{fontFamily:"var(--font-d)",fontSize:20,fontWeight:800,color:"var(--text)",
            letterSpacing:"0.5px",textShadow:"0 2px 12px rgba(0,0,0,0.9)",marginBottom:7}}>
            {dayData.label}
          </div>
          {dayData.muscles?.length>0&&(
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:6}}>
              {dayData.muscles.map(m=>(
                <span key={m} className="muscle-tag"
                  style={{background:`${neon}18`,border:`1px solid ${neon}40`,color:neon}}>
                  {m}
                </span>
              ))}
            </div>
          )}
          {setsLogged>0&&(
            <div style={{fontFamily:"var(--font-m)",fontSize:11,color:`${neon}CC`}}>
              ✓ {setsLogged} set{setsLogged!==1?"s":""} logged today
            </div>
          )}
        </PhotoBanner>
      </div>

      {!isToday&&(
        <div style={{textAlign:"center",fontSize:11,color:"var(--text-3)",marginBottom:10,
          padding:"8px 12px",background:"var(--surf2)",borderRadius:10,border:"1px solid var(--bdr)",
          fontFamily:"var(--font-m)"}}>
          Previewing {prettyDate(dateKey)} — tap ← → to navigate · log from today only
        </div>
      )}

      {timer&&<RestTimer timer={timer} onToggle={()=>setTimer(t=>({...t,running:!t.running}))} onSkip={()=>setTimer(null)}/>}

      {weekday==="Sunday"?(
        <div className="card card-glow" style={{border:`1px solid ${neon}25`}}>
          <div className="card-label">Active Recovery Day</div>
          <p style={{fontSize:14,lineHeight:1.7,color:"var(--text-2)"}}>
            Your muscles grow during rest, not during training. Today: walk 20–30 minutes, stretch for 10 min, and focus on sleep tonight. 💤
          </p>
          <p style={{fontSize:12,color:"var(--text-3)",marginTop:10,fontFamily:"var(--font-m)"}}>
            → Don't skip creatine today. It needs to be taken daily to work.
          </p>
        </div>
      ):(
        dayData.exercises.map(ex=>(
          <ExerciseCard
            key={ex.name+weekday}
            ex={ex}
            neon={neon}
            dayCover={cover}
            isToday={isToday}
            loggedSets={wlog.exercises[ex.name]?.sets||[]}
            history={exerciseHistory(ex.name)}
            onLogSet={set=>{
              if(isToday){ logSet(dateKey,ex.name,set); startTimer(ex.rest,ex.name); }
            }}
          />
        ))
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   CHECKLIST ROWS
   ══════════════════════════════════════════════════════════════ */
function ChecklistRow({icon, label, sub, hint, done, onTap, badge}) {
  return (
    <div className="cl-row" onClick={onTap}>
      {icon}
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:6,fontSize:14,fontWeight:600}}>
          {label}
          {badge && <span className="pill" style={{fontSize:9,padding:"2px 7px",textTransform:"uppercase",letterSpacing:"0.5px"}}>{badge}</span>}
        </div>
        <div style={{fontFamily:"var(--font-m)",fontSize:11,color:"var(--text-2)",marginTop:1}}>{sub}</div>
        {hint&&<div style={{fontSize:11,color:"var(--text-3)",marginTop:2}}>{hint}</div>}
      </div>
      <div className={`cl-check ${done?"done":""}`}>
        {done&&<Check size={14} color="#040F07" strokeWidth={3.5}/>}
      </div>
    </div>
  );
}

function SleepRow({log,onChange}) {
  const h=log.sleepHours, met=h!=null&&h>=GOALS.sleepMin;
  return (
    <div className="cl-row" style={{cursor:"default"}}>
      <Moon size={17} color="var(--purple)"/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:6,fontSize:14,fontWeight:600}}>
          Sleep
          <span className="pill" style={{fontSize:9,padding:"2px 7px",textTransform:"uppercase",letterSpacing:"0.5px",background:"rgba(189,147,249,0.12)",borderColor:"rgba(189,147,249,0.35)",color:"var(--purple)"}}>Log</span>
        </div>
        <div style={{fontFamily:"var(--font-m)",fontSize:11,color:"var(--text-2)",marginTop:1}}>
          {met?"✓ ":""}Target 7.5–9h
        </div>
        <div style={{fontSize:11,color:"var(--text-3)",marginTop:2}}>Use +/− to log last night{"'"}s sleep</div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <div style={{display:"flex",alignItems:"center",gap:4,background:"var(--surf2)",border:"1px solid var(--bdr2)",borderRadius:10,padding:"3px 4px"}}>
          <button className="btn btn-sm" onClick={()=>onChange(Math.max(0,(h||0)-0.5))}>−</button>
          <span style={{fontFamily:"var(--font-m)",fontWeight:700,fontSize:15,width:36,textAlign:"center",
            color:met?"var(--neon)":"var(--text)",
            textShadow:met?"0 0 8px var(--neon)":"none"}}>
            {h!=null?h:"—"}
          </span>
          <button className="btn btn-sm" onClick={()=>onChange((h||0)+0.5)}>+</button>
        </div>
        <span style={{fontSize:10,color:"var(--text-3)",fontFamily:"var(--font-m)"}}>hrs</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   DASHBOARD
   ══════════════════════════════════════════════════════════════ */
function Ring({ value, goal, color, label, unit="", size=84 }) {
  const target = Math.min(100, goal > 0 ? (value/goal)*100 : 0);
  const [anim, setAnim] = useState(0);
  useEffect(() => {
    let raf; const start = performance.now(); const dur = 900;
    const tick = t => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setAnim(eased * target);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  const r = (size - 10) / 2;
  const C = 2 * Math.PI * r;
  const dash = C * (anim / 100);
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
      <div style={{position:"relative",width:size,height:size}}>
        <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
          <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="7" fill="none"/>
          <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth="7" fill="none"
            strokeDasharray={`${dash} ${C}`} strokeLinecap="round"
            style={{filter:`drop-shadow(0 0 6px ${color}80)`}}/>
        </svg>
        <div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
          <div style={{fontFamily:"var(--font-m)",fontSize:14,fontWeight:800,color:"var(--text)"}}>{Math.round(anim)}%</div>
          <div style={{fontSize:9,color:"var(--text-2)",marginTop:1}}>{Math.round(value)}/{Math.round(goal)}{unit}</div>
        </div>
      </div>
      <div style={{fontSize:10,fontWeight:700,color,letterSpacing:"1px",textTransform:"uppercase"}}>{label}</div>
    </div>
  );
}

function DashboardHero({ nutrition, data, tk, wd, dayData }) {
  const name = (nutrition?.profile?.full_name || "").split(" ")[0] || "Athlete";
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const cals = nutrition?.totals?.calories ?? 0;
  const calGoal = nutrition?.goals?.calories ?? 2200;
  const protein = nutrition?.totals?.protein ?? 0;
  const proteinGoal = nutrition?.goals?.protein ?? 130;
  const waterMl = nutrition?.waterMl ?? 0;
  const waterGoal = nutrition?.goals?.water ?? 3500;

  const wlog = data.workoutLogs?.[tk] || { exercises: {} };
  const planned = (dayData?.exercises || []).reduce((s, e) => s + (Number(e.sets) || 0), 0);
  const logged = Object.values(wlog.exercises || {}).reduce((s, e) => s + (e.sets?.length || 0), 0);
  const isRest = wd === "Sunday";
  const workoutPct = isRest ? 100 : planned > 0 ? Math.min(100, (logged / planned) * 100) : 0;
  const workoutVal = isRest ? 1 : logged;
  const workoutGoal = isRest ? 1 : (planned || 1);

  const overall = Math.round(
    (Math.min(100, (cals / Math.max(1, calGoal)) * 100) +
     Math.min(100, (protein / Math.max(1, proteinGoal)) * 100) +
     Math.min(100, (waterMl / Math.max(1, waterGoal)) * 100) +
     workoutPct) / 4
  );

  const waterDone = waterMl >= waterGoal && waterGoal > 0;
  const [celebrated, setCelebrated] = useState(false);
  const prevDone = useRef(false);
  useEffect(() => {
    if (waterDone && !prevDone.current) {
      prevDone.current = true;
      setCelebrated(true);
      const t = setTimeout(() => setCelebrated(false), 2200);
      return () => clearTimeout(t);
    }
    if (!waterDone) prevDone.current = false;
  }, [waterDone]);

  return (
    <div className="card" style={{marginBottom:12,background:"linear-gradient(135deg, rgba(0,255,135,0.06), rgba(0,191,255,0.04))",backdropFilter:"blur(6px)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:12,gap:8}}>
        <div style={{minWidth:0}}>
          <div style={{fontSize:10,color:"var(--text-2)",letterSpacing:"1.5px",textTransform:"uppercase"}}>{greet}</div>
          <div style={{fontFamily:"var(--font-d)",fontSize:20,fontWeight:800,color:"var(--text)",lineHeight:1.1,marginTop:2}}>{name} <span style={{fontSize:16}}>👋</span></div>
        </div>
        <div style={{textAlign:"right",flexShrink:0}}>
          <div style={{fontSize:9,color:"var(--text-2)",textTransform:"uppercase",letterSpacing:"1.5px"}}>Today's Progress</div>
          <div style={{fontFamily:"var(--font-m)",fontSize:22,fontWeight:800,color:"var(--neon)",textShadow:"0 0 10px var(--neon)"}}>{overall}%</div>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
        <Ring value={cals} goal={calGoal} color="#FB923C" label="Calories"/>
        <Ring value={protein} goal={proteinGoal} color="#22C55E" label="Protein" unit="g"/>
        <Ring value={waterMl/1000} goal={waterGoal/1000} color="#3B82F6" label="Water" unit="L"/>
        <Ring value={workoutVal} goal={workoutGoal} color="#EF4444" label="Workout" unit=" sets"/>
      </div>

      <div style={{marginTop:14,position:"relative"}}>
        {celebrated && <div className="water-celebrate">🎉 Goal reached!</div>}
        <WaterTracker
          variant="compact"
          consumedMl={waterMl}
          goalMl={waterGoal}
          onAdd={(ml)=>nutrition?.addWater?.(ml)}
          onReset={()=>nutrition?.resetWater?.()}
        />
      </div>

      <style>{`
        @keyframes celebratePop { 0%{transform:translate(-50%,-50%) scale(0.5);opacity:0} 40%{transform:translate(-50%,-50%) scale(1.15);opacity:1} 100%{transform:translate(-50%,-50%) scale(1);opacity:0} }
        .water-celebrate{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-family:var(--font-d);font-weight:800;font-size:16px;color:#60A5FA;text-shadow:0 0 12px #3B82F6;animation:celebratePop 2.2s ease-out forwards;z-index:2;pointer-events:none;white-space:nowrap}
      `}</style>
    </div>
  );
}

function Dashboard({data, updateDaily, setTab, streak, nutrition}) {
  const tk=todayKey(), log=getDailyLog(data,tk);
  const wd=weekdayOf(tk), isRest=wd==="Sunday";
  const dayData=getDayData(data,wd), neon=DAY_NEON[wd];

  // Shared nutrition source of truth (Supabase-backed)
  const proteinG = Math.round(nutrition?.totals?.protein ?? 0);
  const proteinGoal = Math.round(nutrition?.goals?.protein ?? GOALS.proteinMin);
  const waterMl = Math.round(nutrition?.waterMl ?? 0);
  const waterGoal = Math.round(nutrition?.goals?.water ?? GOALS.waterMin);
  const proteinDone = proteinG >= proteinGoal && proteinGoal > 0;
  const waterDone = waterMl >= waterGoal && waterGoal > 0;

  const allDone = isDayComplete(log);
  const plates=[
    {done:!!log.creatine,         color:"var(--neon)"},
    {done:proteinDone, color:"var(--cyan)"},
    {done:waterDone,   color:"#00BFFF"},
    {done:log.sleepHours!=null&&log.sleepHours>=GOALS.sleepMin, color:"var(--purple)"},
  ];

  return (
    <>
      <DashboardHero nutrition={nutrition} data={data} tk={tk} wd={wd} dayData={dayData}/>

      {!data.onboardingDismissed&&(
        <div className="card" style={{borderColor:"rgba(0,255,135,0.3)",background:"rgba(0,255,135,0.04)",marginBottom:12}}>
          <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
            <Info size={16} color="var(--neon)" style={{flexShrink:0,marginTop:2}}/>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700,color:"var(--neon)",marginBottom:4}}>Welcome, Beginner 👋</div>
              <div style={{fontSize:12,lineHeight:1.65,color:"var(--text-2)"}}>
                For the first 2–3 weeks, don't worry about the weight — focus on moving with good form. Your muscles are learning the movement patterns right now. That foundation is what everything else gets built on.
              </div>
            </div>
            <button className="btn btn-ghost btn-icon btn-sm" onClick={()=>updateDaily(tk,{},{dismiss:true})}><X size={13}/></button>
          </div>
        </div>
      )}

      {/* Day hero card */}
      <div className="card card-photo" style={{marginBottom:12,border:`1px solid ${neon}20`}}>
        <PhotoBanner src={DAY_COVER[wd]} fallbackSrc={DAY_COVER[wd]} height={150} alt={wd} neon={neon}>
          <div style={{fontFamily:"var(--font-d)",fontSize:9,color:neon,letterSpacing:"2px",textTransform:"uppercase",marginBottom:4,
            textShadow:`0 0 8px ${neon}70`}}>{wd}</div>
          <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:10}}>
            <div>
              <div style={{fontFamily:"var(--font-d)",fontSize:18,fontWeight:800,color:"var(--text)",
                textShadow:"0 2px 10px rgba(0,0,0,0.9)",marginBottom:5}}>
                {isRest?"Rest & Recover":dayData.label}
              </div>
              {dayData.muscles?.length>0&&(
                <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                  {dayData.muscles.map(m=>(
                    <span key={m} className="muscle-tag" style={{background:`${neon}18`,border:`1px solid ${neon}40`,color:neon}}>{m}</span>
                  ))}
                </div>
              )}
            </div>
            <button className="btn btn-neon btn-sm" onClick={()=>setTab("workout")} style={{flexShrink:0,fontSize:12}}>
              {isRest?"Recovery Plan":"Start Workout"}
            </button>
          </div>
        </PhotoBanner>
      </div>

      {/* Mission control / checklist */}
      <div className={`card ${allDone?"card-glow":""}`}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div className="card-label" style={{marginBottom:0}}>Mission Control</div>
          <div className="streak-badge">
            <Flame size={13} color="var(--neon)"/>
            <span style={{fontFamily:"var(--font-m)",fontWeight:700,fontSize:13,color:"var(--neon)"}}>{streak}</span>
            <span style={{fontSize:11,color:"var(--text-2)"}}>day streak</span>
          </div>
        </div>

        {allDone&&(
          <div style={{fontFamily:"var(--font-m)",fontSize:11,color:"var(--neon)",marginBottom:6,
            textShadow:"0 0 8px var(--neon)"}}>
            ✦ Perfect day — your body is going to thank you for this ✦
          </div>
        )}

        <PlateLoader items={plates}/>

        <ChecklistRow
          icon={<Sparkles size={16} color="var(--neon)"/>}
          label="Creatine" sub="3–5 g logged"
          hint="Helps muscles retain energy — take it daily, even rest days"
          done={!!log.creatine}
          onTap={()=>updateDaily(tk,{creatine:!log.creatine})}/>
        <ChecklistRow
          icon={<Dumbbell size={16} color="var(--cyan)"/>}
          label="Protein" sub={`${proteinG}g of ${proteinGoal}g goal${proteinDone ? " · complete ✓" : ""}`}
          hint="Protein is the raw material your muscles rebuild with"
          done={proteinDone}
          onTap={()=>setTab("nutrition")}/>
        <ChecklistRow
          icon={<Droplet size={16} color="#00BFFF"/>}
          label="Water" sub={`${(waterMl/1000).toFixed(2)}L of ${(waterGoal/1000).toFixed(2)}L goal${waterDone ? " · complete ✓" : ""}`}
          hint="Even mild dehydration cuts strength by ~10%"
          done={waterDone}
          onTap={()=>setTab("nutrition")}/>
        <SleepRow log={log} onChange={h=>updateDaily(tk,{sleepHours:h})}/>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   NUTRITION TAB
   ══════════════════════════════════════════════════════════════ */
function ProgBar({value, min, color}) {
  const pct=Math.min(100,(value/min)*100);
  const done=value>=min;
  return (
    <div className="prog-track">
      <div className="prog-fill" style={{
        width:`${pct}%`,
        background:done?`linear-gradient(90deg,var(--neon-dim),var(--neon))`:`linear-gradient(90deg,${color}90,${color})`,
        boxShadow:done?"0 0 8px var(--neon)":undefined,
      }}/>
    </div>
  );
}

function MealRow({meal, imgKey, done, onTap}) {
  const [failed, setFailed]=useState(false);
  const src=NUT_IMG[imgKey];
  return (
    <div onClick={onTap} style={{display:"flex",alignItems:"center",gap:11,padding:"11px 0",
      borderTop:"1px solid var(--bdr)",cursor:"pointer"}}>
      <div style={{width:52,height:52,borderRadius:10,overflow:"hidden",flexShrink:0,
        background:"var(--surf3)",position:"relative",border:"1px solid var(--bdr)"}}>
        {src&&!failed&&<img src={src} alt={meal.label} onError={()=>setFailed(true)}
          style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>}
      </div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:600}}>{meal.label}</div>
        <div style={{fontSize:11,color:"var(--text-2)",marginTop:2}}>{meal.items}</div>
        <div style={{fontFamily:"var(--font-m)",fontSize:11,color:"var(--cyan)",marginTop:3}}>+{meal.proteinG}g protein</div>
      </div>
      <div className={`cl-check ${done?"done":""}`} style={{flexShrink:0}}>
        {done&&<Check size={14} color="#040F07" strokeWidth={3.5}/>}
      </div>
    </div>
  );
}

function NutritionTab({data, updateDaily}) {
  const tk=todayKey(), log=getDailyLog(data,tk);
  const [customP,setCustomP]=useState("");

  const addProt  = g  => updateDaily(tk,{proteinG:Math.max(0,log.proteinG+g)});
  const addWater = ml => updateDaily(tk,{waterMl:Math.max(0,log.waterMl+ml)});
  const toggleMeal=(key,pg)=>{
    const was=log.mealsLogged[key];
    updateDaily(tk,{mealsLogged:{...log.mealsLogged,[key]:!was},proteinG:Math.max(0,log.proteinG+(was?-pg:pg))});
  };

  return (
    <>
      <div className="card">
        <div className="card-label">Routine Meals</div>
        <div style={{fontSize:11,color:"var(--text-2)",marginBottom:10,lineHeight:1.5}}>
          Tap to mark as eaten. Protein is auto-added to your daily total.
        </div>
        <MealRow meal={PRE_WORKOUT}  imgKey="pre"  done={log.mealsLogged.pre}  onTap={()=>toggleMeal("pre",PRE_WORKOUT.proteinG)}/>
        <MealRow meal={POST_WORKOUT} imgKey="post" done={log.mealsLogged.post} onTap={()=>toggleMeal("post",POST_WORKOUT.proteinG)}/>
      </div>

      <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div className="card-label" style={{marginBottom:0}}>Daily Protein</div>
          <span style={{fontFamily:"var(--font-m)",fontSize:13,fontWeight:700,
            color:log.proteinG>=GOALS.proteinMin?"var(--neon)":"var(--text)"}}>
            {log.proteinG}g <span style={{color:"var(--text-3)"}}>/ {GOALS.proteinMin}g min</span>
          </span>
        </div>
        <ProgBar value={log.proteinG} min={GOALS.proteinMin} color="var(--cyan)"/>
        <div style={{fontSize:11,color:"var(--text-3)",marginTop:7,marginBottom:11,fontFamily:"var(--font-m)"}}>
          Aim for {GOALS.proteinMin}–{GOALS.proteinMax}g/day. Spread it across meals — 3–4 servings works best.
        </div>
        <div style={{display:"flex",gap:7,flexWrap:"wrap"}}>
          {[10,20,25,30,40].map(g=>(
            <button key={g} className="btn btn-sm" onClick={()=>addProt(g)}>+{g}g</button>
          ))}
          <button className="btn btn-danger btn-sm" onClick={()=>updateDaily(tk,{proteinG:0})}>Reset</button>
        </div>
        <div style={{display:"flex",gap:8,marginTop:9}}>
          <input type="number" placeholder="Custom amount (g)…" value={customP} onChange={e=>setCustomP(e.target.value)}
            style={{flex:1}} onKeyDown={e=>e.key==="Enter"&&customP&&(addProt(+customP),setCustomP(""))}/>
          <button className="btn btn-neon btn-sm" onClick={()=>{if(customP){addProt(+customP);setCustomP("");}}}> Add</button>
        </div>
      </div>

      <div className="card">
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div className="card-label" style={{marginBottom:0}}>Hydration</div>
          <span style={{fontFamily:"var(--font-m)",fontSize:13,fontWeight:700,
            color:log.waterMl>=GOALS.waterMin?"var(--neon)":"var(--text)"}}>
            {(log.waterMl/1000).toFixed(2)}L <span style={{color:"var(--text-3)"}}>/ 3L min</span>
          </span>
        </div>
        <ProgBar value={log.waterMl} min={GOALS.waterMin} color="#00BFFF"/>
        <div style={{fontSize:11,color:"var(--text-3)",marginTop:7,marginBottom:11,fontFamily:"var(--font-m)"}}>
          Sip throughout the day. Start with a full glass when you wake up.
        </div>
        <div style={{display:"flex",gap:7}}>
          {[250,500,750].map(ml=>(
            <button key={ml} className="btn btn-sm" style={{flex:1}} onClick={()=>addWater(ml)}>+{ml}ml</button>
          ))}
          <button className="btn btn-danger btn-sm" onClick={()=>updateDaily(tk,{waterMl:0})}>Reset</button>
        </div>
      </div>

      {/* Creatine with photo */}
      <div className="card" style={{display:"flex",alignItems:"flex-start",gap:12}}>
        <div style={{width:56,height:56,borderRadius:10,overflow:"hidden",flexShrink:0,
          background:"var(--surf3)",position:"relative",border:"1px solid var(--bdr)"}}>
          <img src={NUT_IMG.creatine} alt="Creatine" onError={e=>{e.target.style.display="none";}}
            style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
        </div>
        <div style={{flex:1}}>
          <div style={{fontWeight:600,fontSize:14}}>Creatine</div>
          <div style={{fontSize:11,color:"var(--text-2)",margin:"4px 0 2px"}}>3–5 g · every single day</div>
          <div style={{fontSize:11,color:"var(--text-3)",fontFamily:"var(--font-m)",lineHeight:1.5}}>
            It builds up in your muscles over 4 weeks. Skipping even rest days slows this down.
          </div>
        </div>
        <div className={`cl-check ${log.creatine?"done":""}`} style={{cursor:"pointer",marginTop:2}}
          onClick={()=>updateDaily(tk,{creatine:!log.creatine})}>
          {log.creatine&&<Check size={14} color="#040F07" strokeWidth={3.5}/>}
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════════════════════════════════
   PROGRESS TAB
   ══════════════════════════════════════════════════════════════ */
/* Comprehensive analytics dashboard – reads workout localstorage + Supabase diary/water/weight */
function ProgressTab({data, onReset, nutrition}) {
  const [range, setRange] = useState("weekly"); // daily | weekly | monthly | yearly
  const rangeDays = range === "daily" ? 7 : range === "weekly" ? 28 : range === "monthly" ? 90 : 365;
  const [diary, setDiary] = useState([]);       // rows {entry_date, calories, protein, carbs, fat, fiber}
  const [waters, setWaters] = useState([]);      // rows {log_date, amount_ml}
  const [weights, setWeights] = useState([]);    // rows {recorded_at, weight_kg, bmi}

  const uid = nutrition?.userId;

  const loadRemote = useCallback(async () => {
    if (!uid) return;
    const start = shiftKey(todayKey(), -rangeDays + 1);
    const [{data: d}, {data: w}, {data: wh}] = await Promise.all([
      supabase.from("diary_entries").select("entry_date,calories,protein,carbs,fat,fiber").eq("user_id", uid).gte("entry_date", start),
      supabase.from("water_logs").select("log_date,amount_ml").eq("user_id", uid).gte("log_date", start),
      supabase.from("weight_history").select("recorded_at,weight_kg,bmi").eq("user_id", uid).order("recorded_at"),
    ]);
    setDiary(d || []); setWaters(w || []); setWeights(wh || []);
  }, [uid, rangeDays]);

  useEffect(() => { loadRemote(); }, [loadRemote]);
  useEffect(() => {
    if (!uid) return;
    const ch = supabase.channel(`stats-sync-${uid}`)
      .on("postgres_changes", {event:"*", schema:"public", table:"diary_entries", filter:`user_id=eq.${uid}`}, () => loadRemote())
      .on("postgres_changes", {event:"*", schema:"public", table:"water_logs", filter:`user_id=eq.${uid}`}, () => loadRemote())
      .on("postgres_changes", {event:"*", schema:"public", table:"weight_history", filter:`user_id=eq.${uid}`}, () => loadRemote())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [uid, loadRemote]);

  // Build day-by-day arrays over rangeDays
  const days = useMemo(() => Array.from({length: rangeDays}, (_, i) => shiftKey(todayKey(), -(rangeDays - 1 - i))), [rangeDays]);

  // Workout stats
  const workoutStats = useMemo(() => {
    let sessions = 0, sets = 0, reps = 0, weightLifted = 0;
    const dayCounts = days.map(d => {
      const wl = data.workoutLogs[d];
      const done = wl && Object.values(wl.exercises||{}).some(e => e.sets?.length>0);
      if (done) sessions++;
      let s=0,r=0,w=0;
      Object.values(wl?.exercises||{}).forEach(ex => {
        (ex.sets||[]).forEach(st => { s++; r+=Number(st.reps||0); w+=Number(st.reps||0)*Number(st.weight||0); });
      });
      sets+=s; reps+=r; weightLifted+=w;
      return { date: d.slice(5), sessions: done?1:0, sets:s, reps:r, volume:w };
    });
    // streak
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (dayCounts[i].sessions) streak++; else break;
    }
    // per week / per month
    const perWeek = Math.round((sessions / Math.max(1, rangeDays)) * 7 * 10) / 10;
    const perMonth = Math.round((sessions / Math.max(1, rangeDays)) * 30);
    return { sessions, sets, reps, weightLifted, dayCounts, streak, perWeek, perMonth, completion: Math.round(sessions/Math.max(1, rangeDays)*100) };
  }, [data, days, rangeDays]);

  // Nutrition series
  const nutritionSeries = useMemo(() => {
    const m = new Map(days.map(d => [d, {date: d.slice(5), calories:0, protein:0, carbs:0, fat:0, fiber:0, water:0}]));
    diary.forEach(e => { const r = m.get(e.entry_date); if(!r) return;
      r.calories+=Number(e.calories||0); r.protein+=Number(e.protein||0);
      r.carbs+=Number(e.carbs||0); r.fat+=Number(e.fat||0); r.fiber+=Number(e.fiber||0); });
    waters.forEach(w => { const r = m.get(w.log_date); if(!r) return; r.water += Number(w.amount_ml||0); });
    return Array.from(m.values());
  }, [diary, waters, days]);

  const avg = (arr, k) => arr.length ? Math.round(arr.reduce((a,r)=>a+r[k],0)/arr.length) : 0;
  const totalToday = nutritionSeries[nutritionSeries.length-1] || {calories:0,protein:0,carbs:0,fat:0,fiber:0,water:0};

  const weightSeries = useMemo(() => weights.map(w => ({
    date: (w.recorded_at || "").slice(5,10),
    weight: Number(w.weight_kg),
    bmi: Number(w.bmi),
  })), [weights]);

  const profile = nutrition?.profile;
  const startingW = profile?.starting_weight_kg ?? profile?.weight_kg;
  const currentW  = profile?.weight_kg;
  const targetW   = profile?.target_weight_kg;

  // Personal records
  const PR_LIFTS = ["Barbell Bench Press","Squat","Barbell Squat","Romanian Deadlift","Seated Dumbbell Shoulder Press"];
  const prs = useMemo(() => {
    const out = {};
    Object.values(data.workoutLogs||{}).forEach(wl => {
      Object.entries(wl.exercises||{}).forEach(([name, ex]) => {
        (ex.sets||[]).forEach(s => {
          const w = Number(s.weight||0); if(!w) return;
          if (!out[name] || w > out[name]) out[name] = w;
        });
      });
    });
    return out;
  }, [data]);

  // Exercise progress selector
  const allNames = useMemo(() => [...new Set(Object.values(DEFAULT_SPLIT).flatMap(d => d.exercises.map(e=>e.name)))], []);
  const [selEx, setSelEx] = useState(allNames[0]);
  const exHistory = useMemo(() => buildHistory(data, selEx), [data, selEx]);
  const exBestWeight = exHistory.reduce((m,h)=>Math.max(m,h.topWeight),0);
  const exSeries = useMemo(() => {
    // include reps + volume from raw logs
    const rows = [];
    Object.keys(data.workoutLogs||{}).sort().forEach(date => {
      const ex = data.workoutLogs[date]?.exercises?.[selEx];
      if (!ex?.sets?.length) return;
      const weights = ex.sets.filter(s=>s.weight!=null);
      if (!weights.length) return;
      const topWeight = Math.max(...weights.map(s=>s.weight));
      const bestReps = Math.max(...ex.sets.map(s=>Number(s.reps||0)));
      const volume = ex.sets.reduce((a,s)=>a+Number(s.reps||0)*Number(s.weight||0),0);
      rows.push({date: date.slice(5), weight: topWeight, reps: bestReps, volume});
    });
    return rows.slice(-20);
  }, [data, selEx]);
  const exBestReps = exSeries.reduce((m,r)=>Math.max(m,r.reps||0),0);
  const exTotalVolume = exSeries.reduce((a,r)=>a+r.volume,0);

  const g = nutrition?.goals || {calories:2200,protein:130,carbs:250,fat:70,fiber:30,water:3500};

  return (
    <>
      {/* Range filter */}
      <div className="card">
        <div className="card-label">Range</div>
        <div style={{display:"flex", gap:6, flexWrap:"wrap"}}>
          {[["daily","Daily"],["weekly","Weekly"],["monthly","Monthly"],["yearly","Yearly"]].map(([k,l])=>(
            <button key={k} className="btn btn-sm" onClick={()=>setRange(k)}
              style={{flex:1, minWidth:70,
                background: range===k?"rgba(0,255,135,0.15)":"transparent",
                borderColor: range===k?"var(--neon)":"var(--bdr)",
                color: range===k?"var(--neon)":"var(--text-2)"}}>{l}</button>
          ))}
        </div>
      </div>

      {/* Overall workout progress */}
      <div className="card card-glow">
        <div className="card-label">Workout Progress</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10, marginBottom:12}}>
          <StatCell label="Sessions"     value={workoutStats.sessions}       color="var(--neon)"/>
          <StatCell label="Streak"       value={`${workoutStats.streak}d`}   color="var(--yellow)"/>
          <StatCell label="Per Week"     value={workoutStats.perWeek}        color="var(--cyan)"/>
          <StatCell label="Per Month"    value={workoutStats.perMonth}       color="var(--purple)"/>
          <StatCell label="Completion"   value={`${workoutStats.completion}%`} color="var(--neon)"/>
          <StatCell label="Volume (kg)"  value={Math.round(workoutStats.weightLifted)} color="var(--cyan)"/>
        </div>
        <div style={{height:150}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={workoutStats.dayCounts}>
              <CartesianGrid stroke="rgba(0,255,135,0.06)" strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="date" tick={{fontSize:9,fill:"var(--text-2)"}} axisLine={{stroke:"var(--bdr)"}} tickLine={false}/>
              <YAxis tick={{fontSize:9,fill:"var(--text-2)"}} axisLine={false} tickLine={false} width={28}/>
              <Tooltip contentStyle={{background:"var(--surf)",border:"1px solid var(--bdr2)",fontSize:11,borderRadius:9}}/>
              <Bar dataKey="volume" fill="var(--neon)" name="Volume (kg)"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Body weight */}
      <div className="card">
        <div className="card-label">Body Weight Progress</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
          <MiniStat label="Starting" value={startingW ? `${startingW} kg` : "—"} />
          <MiniStat label="Current"  value={currentW ? `${currentW} kg` : "—"} accent />
          <MiniStat label="Target"   value={targetW ? `${targetW} kg` : "Set in profile"} />
        </div>
        {weightSeries.length>0 ? (
          <div style={{height:150}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightSeries}>
                <CartesianGrid stroke="rgba(0,255,135,0.06)" strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="date" tick={{fontSize:9,fill:"var(--text-2)"}} axisLine={{stroke:"var(--bdr)"}} tickLine={false}/>
                <YAxis tick={{fontSize:9,fill:"var(--text-2)"}} axisLine={false} tickLine={false} width={28} domain={["dataMin-1","dataMax+1"]}/>
                <Tooltip contentStyle={{background:"var(--surf)",border:"1px solid var(--bdr2)",fontSize:11,borderRadius:9}}/>
                <Line type="monotone" dataKey="weight" stroke="var(--yellow)" strokeWidth={2} dot={{r:3,fill:"var(--yellow)"}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : <EmptyLine text="No weight snapshots yet. Update your profile weight to start tracking." />}
      </div>

      {/* BMI */}
      <div className="card">
        <div className="card-label">BMI Progress</div>
        {weightSeries.filter(w=>w.bmi).length>0 ? (
          <div style={{height:150}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightSeries}>
                <CartesianGrid stroke="rgba(0,255,135,0.06)" strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="date" tick={{fontSize:9,fill:"var(--text-2)"}} axisLine={{stroke:"var(--bdr)"}} tickLine={false}/>
                <YAxis tick={{fontSize:9,fill:"var(--text-2)"}} axisLine={false} tickLine={false} width={28} domain={["dataMin-1","dataMax+1"]}/>
                <Tooltip contentStyle={{background:"var(--surf)",border:"1px solid var(--bdr2)",fontSize:11,borderRadius:9}}/>
                <Line type="monotone" dataKey="bmi" stroke="var(--purple)" strokeWidth={2} dot={{r:3,fill:"var(--purple)"}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : <EmptyLine text="BMI history will appear after your first weight update." />}
      </div>

      {/* Calories */}
      <div className="card">
        <div className="card-label">Calories</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
          <MiniStat label="Today"   value={`${Math.round(totalToday.calories)} kcal`} accent />
          <MiniStat label="Avg"     value={`${avg(nutritionSeries,"calories")}`} />
          <MiniStat label="Goal"    value={`${g.calories}`} />
        </div>
        <div style={{height:150}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={nutritionSeries}>
              <CartesianGrid stroke="rgba(0,255,135,0.06)" strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="date" tick={{fontSize:9,fill:"var(--text-2)"}} axisLine={{stroke:"var(--bdr)"}} tickLine={false}/>
              <YAxis tick={{fontSize:9,fill:"var(--text-2)"}} axisLine={false} tickLine={false} width={28}/>
              <Tooltip contentStyle={{background:"var(--surf)",border:"1px solid var(--bdr2)",fontSize:11,borderRadius:9}}/>
              <Bar dataKey="calories" fill="var(--cyan)"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Macros */}
      <div className="card">
        <div className="card-label">Macronutrients</div>
        <MacroSection label="Protein" data={nutritionSeries} dataKey="protein" color="#FF7A9E" goal={g.protein} today={totalToday.protein}/>
        <MacroSection label="Carbs"   data={nutritionSeries} dataKey="carbs"   color="#FFD60A" goal={g.carbs}   today={totalToday.carbs}/>
        <MacroSection label="Fat"     data={nutritionSeries} dataKey="fat"     color="var(--purple)" goal={g.fat}     today={totalToday.fat}/>
        <MacroSection label="Fiber"   data={nutritionSeries} dataKey="fiber"   color="var(--neon)"   goal={g.fiber}   today={totalToday.fiber}/>
      </div>

      {/* Water */}
      <div className="card">
        <div className="card-label">Water Intake</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
          <MiniStat label="Today"   value={`${(totalToday.water/1000).toFixed(2)} L`} accent />
          <MiniStat label="Avg"     value={`${(avg(nutritionSeries,"water")/1000).toFixed(2)} L`} />
          <MiniStat label="Goal"    value={`${(g.water/1000).toFixed(2)} L`} />
        </div>
        <div style={{height:150}}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={nutritionSeries}>
              <CartesianGrid stroke="rgba(0,255,135,0.06)" strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="date" tick={{fontSize:9,fill:"var(--text-2)"}} axisLine={{stroke:"var(--bdr)"}} tickLine={false}/>
              <YAxis tick={{fontSize:9,fill:"var(--text-2)"}} axisLine={false} tickLine={false} width={28}/>
              <Tooltip contentStyle={{background:"var(--surf)",border:"1px solid var(--bdr2)",fontSize:11,borderRadius:9}}/>
              <Bar dataKey="water" fill="#00BFFF" name="Water (ml)"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Exercise progress */}
      <div className="card">
        <div className="card-label">Exercise Progress</div>
        <select value={selEx} onChange={e=>setSelEx(e.target.value)} style={{marginBottom:12}}>
          {Object.entries(DEFAULT_SPLIT).filter(([d])=>d!=="Sunday").map(([d,info])=>(
            <optgroup key={d} label={`${d} — ${info.label}`}>
              {info.exercises.map(e=><option key={e.name} value={e.name}>{e.name}</option>)}
            </optgroup>
          ))}
        </select>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
          <MiniStat label="Best Weight" value={exBestWeight ? `${exBestWeight} kg` : "—"} accent/>
          <MiniStat label="Best Reps"   value={exBestReps || "—"} />
          <MiniStat label="Volume"      value={exTotalVolume ? `${Math.round(exTotalVolume)} kg` : "—"} />
        </div>
        {exSeries.length ? (
          <div style={{height:150}}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={exSeries}>
                <CartesianGrid stroke="rgba(0,255,135,0.06)" strokeDasharray="3 3" vertical={false}/>
                <XAxis dataKey="date" tick={{fontSize:9,fill:"var(--text-2)"}} axisLine={{stroke:"var(--bdr)"}} tickLine={false}/>
                <YAxis tick={{fontSize:9,fill:"var(--text-2)"}} axisLine={false} tickLine={false} width={28}/>
                <Tooltip contentStyle={{background:"var(--surf)",border:"1px solid var(--bdr2)",fontSize:11,borderRadius:9}}/>
                <Legend wrapperStyle={{fontSize:10}}/>
                <Line type="monotone" dataKey="weight" stroke="var(--neon)" strokeWidth={2} dot={{r:3,fill:"var(--neon)"}}/>
                <Line type="monotone" dataKey="volume" stroke="var(--cyan)" strokeWidth={2} dot={{r:3,fill:"var(--cyan)"}}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : <EmptyLine text="Log sets for this exercise to see progression." />}
      </div>

      {/* Personal Records */}
      <div className="card">
        <div className="card-label" style={{display:"flex",alignItems:"center",gap:6}}>
          <Trophy size={12} color="var(--yellow)"/> Personal Records
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr",gap:6}}>
          {[
            ["Bench Press",           prs["Barbell Bench Press"]],
            ["Squat",                 prs["Barbell Squat"] || prs["Squat"]],
            ["Deadlift (RDL top set)",prs["Romanian Deadlift"]],
            ["Overhead Press",        prs["Seated Dumbbell Shoulder Press"]],
          ].map(([label,val]) => (
            <div key={label} style={{display:"flex",alignItems:"center",justifyContent:"space-between",
              padding:"10px 12px",borderRadius:10,border:"1px solid var(--bdr)",background:"var(--surf)"}}>
              <span style={{fontSize:12,color:"var(--text-2)"}}>{label}</span>
              <span style={{fontFamily:"var(--font-m)",fontWeight:700,fontSize:14,
                color: val?"var(--yellow)":"var(--text-3)",
                textShadow: val?"0 0 8px rgba(255,214,10,0.4)":"none"}}>
                {val ? `${val} kg` : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button className="btn btn-ghost btn-sm"
        style={{width:"100%",justifyContent:"center",color:"var(--text-3)",marginTop:4}}
        onClick={onReset}>
        <RotateCcw size={12}/> Reset all logged workout data
      </button>
    </>
  );
}

function MiniStat({label,value,accent}) {
  return (
    <div style={{padding:"10px 8px", borderRadius:10, border:"1px solid var(--bdr)", background:"var(--surf)"}}>
      <div style={{fontSize:9,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:1,marginBottom:4}}>{label}</div>
      <div style={{fontFamily:"var(--font-m)",fontWeight:700,fontSize:15,
        color: accent?"var(--neon)":"var(--text)",
        textShadow: accent?"0 0 6px rgba(0,255,135,0.4)":"none"}}>{value}</div>
    </div>
  );
}

function EmptyLine({text}) {
  return <div style={{textAlign:"center",padding:"18px 0",color:"var(--text-3)",fontSize:11,fontFamily:"var(--font-m)"}}>{text}</div>;
}

function MacroSection({label, data, dataKey, color, goal, today}) {
  const avgVal = data.length ? Math.round(data.reduce((a,r)=>a+r[dataKey],0)/data.length) : 0;
  return (
    <div style={{marginTop:10, paddingTop:10, borderTop:"1px solid var(--bdr)"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6}}>
        <div style={{fontSize:12,fontWeight:600,color:"var(--text)"}}>{label}</div>
        <div style={{fontFamily:"var(--font-m)",fontSize:10,color:"var(--text-2)"}}>
          Today <b style={{color: today>=goal?"var(--neon)":"var(--text)"}}>{Math.round(today)}g</b> ·
          Avg <b>{avgVal}g</b> · Goal <b>{Math.round(goal)}g</b>
        </div>
      </div>
      <div style={{height:70}}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" hide/>
            <YAxis hide/>
            <Tooltip contentStyle={{background:"var(--surf)",border:"1px solid var(--bdr2)",fontSize:10,borderRadius:9}}/>
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function StatCell({label,value,color}) {
  return (
    <div className="stat-cell">
      <div style={{fontFamily:"var(--font-m)",fontWeight:700,fontSize:22,color,
        textShadow:`0 0 10px ${color}50`}}>{value}</div>
      <div style={{fontSize:11,color:"var(--text-2)",marginTop:3}}>{label}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   APP ROOT
   ══════════════════════════════════════════════════════════════ */
export default function App() {
  const [data,    setData]    = useState(null);
  const [tab,     setTab]     = useState("dashboard");
  const [dateKey, setDateKey] = useState(todayKey());
  const [editDay, setEditDay] = useState(null);
  const navigate = useNavigate();
  const nutrition = useDailyNutrition();

  const handleSetTab = useCallback((next) => {
    if (next === "nutrition") {
      navigate({ to: "/macros" });
      return;
    }
    setTab(next);
  }, [navigate]);

  useEffect(()=>{ loadData().then(setData); }, []);

  const mutate = useCallback(updater => {
    setData(prev => { const next=updater(prev); persist(next); return next; });
  }, []);

  const updateDaily = useCallback((key, patch, meta) => {
    mutate(prev => {
      const cur = getDailyLog(prev,key);
      return {
        ...prev,
        dailyLogs: {...prev.dailyLogs, [key]:{...cur,...patch}},
        ...(meta?.dismiss ? {onboardingDismissed:true} : {}),
      };
    });
  }, [mutate]);

  const logSet = useCallback((key,exName,set) => {
    mutate(prev => {
      const wl = getWorkoutLog(prev,key);
      const ex = wl.exercises[exName]||{sets:[]};
      return {...prev, workoutLogs:{...prev.workoutLogs,[key]:{...wl,
        exercises:{...wl.exercises,[exName]:{...ex,sets:[...ex.sets,set]}}}}};
    });
  }, [mutate]);

  const saveCustomDay = useCallback((weekday, dayData) => {
    mutate(prev => ({...prev, customSplit:{...(prev.customSplit||{}), [weekday]:dayData}}));
  }, [mutate]);

  const exerciseHistory = useCallback(name => data ? buildHistory(data,name) : [], [data]);

  const streak = useMemo(() => {
    if (!data) return 0;
    let count=0, cur=todayKey();
    if (!isDayComplete(getDailyLog(data,cur))) cur=shiftKey(cur,-1);
    while (true) {
      const l=data.dailyLogs[cur];
      if (l&&isDayComplete(l)) { count++; cur=shiftKey(cur,-1); } else break;
    }
    return count;
  }, [data]);

  const openEditor = () => {
    setEditDay(tab==="workout" ? weekdayOf(dateKey) : weekdayOf(todayKey()));
  };

  const resetAll = () => {
    if (window.confirm&&!window.confirm("Clear all data? This cannot be undone.")) return;
    mutate(()=>({...EMPTY_DATA}));
  };

  if (!data) return (
    <div className="ff-root">
      <style>{STYLE}</style>
      <div className="ff-shell" style={{alignItems:"center",justifyContent:"center"}}>
        <div style={{fontFamily:"var(--font-d)",fontSize:12,color:"var(--neon)",letterSpacing:"3px",
          textShadow:"0 0 12px var(--neon)"}}>LOADING…</div>
      </div>
    </div>
  );

  return (
    <div className="ff-root">
      <style>{STYLE}</style>
      <div className="ff-shell">
        <Header/>
        <div className="ff-scroll">
          {tab==="dashboard" && <Dashboard data={data} updateDaily={updateDaily} setTab={handleSetTab} streak={streak} nutrition={nutrition}/>}
          {tab==="workout"   && <WorkoutTab data={data} dateKey={dateKey} setDateKey={setDateKey} logSet={logSet} exerciseHistory={exerciseHistory} onOpenEditor={openEditor}/>}
          {tab==="progress"  && <ProgressTab data={data} onReset={resetAll} nutrition={nutrition}/>}
        </div>
        <BottomNav tab={tab} setTab={handleSetTab}/>

        {editDay && (
          <WorkoutEditorModal
            data={data}
            weekday={editDay}
            onSave={saveCustomDay}
            onClose={()=>setEditDay(null)}
          />
        )}
      </div>
    </div>
  );
}
