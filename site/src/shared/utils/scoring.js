export const clampScore=(score)=>Math.max(0,Math.min(100,Number(score)||0));
export const starsFromScore=(score)=>{const value=clampScore(score);return value>=95?3:value>=80?2:value>=60?1:0;};
