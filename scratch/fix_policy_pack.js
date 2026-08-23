const fs = require('fs');

const path = 'd:\\xevn-ecosystem\\apps\\web\\hrm\\src\\components\\payroll\\policy-pack\\PolicyPackSetupScreen.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find the correct start of imports
const correctStart = `import { useState, type FormEvent } from 'react';
import {
  useListPolicyPacks,`;

const startIndex = content.indexOf(correctStart);
if (startIndex !== -1) {
  // Find the end of the comment block just before this
  const commentEnd = `CNTTBEQC1-MSO8HVERQC1 không mở lại\r\n */\r\n`;
  const commentEnd2 = `CNTTBEQC1-MSO8HVERQC1 không mở lại\n */\n`;
  
  let validCommentEnd = content.lastIndexOf(commentEnd, startIndex);
  if (validCommentEnd === -1) {
    validCommentEnd = content.lastIndexOf(commentEnd2, startIndex);
  }
  
  if (validCommentEnd !== -1) {
    // Keep everything up to the end of the valid comment block, 
    // then append the correct start
    const endOfValidComment = validCommentEnd + (content.includes(commentEnd) ? commentEnd.length : commentEnd2.length);
    const topPart = content.substring(0, endOfValidComment);
    const bottomPart = content.substring(startIndex);
    
    fs.writeFileSync(path, topPart + bottomPart);
    console.log("File fixed successfully!");
  } else {
    console.log("Could not find comment end before correct start.");
  }
} else {
  console.log("Could not find correct start.");
}
