# TORR EC: Bug Bash


## Executive Summary
This document outlines issues and concerns identified during the Lab 02.26.2026 bug bash. A summary of goals include resolving visual, structural, and data-logging issues to ensure the experiment provides precise and reliable results.

### Part 0: Using Git
#### Instructions for Contributors (Git Workflow)
To ensure all contributors remain up to date and can safely make changes without overwriting each other's work, please follow this basic Git workflow *every time* you log on:
1.  **Check Status and Pull First:** Always start by pulling from Git (e.g., `git pull`) to ensure you have everyone else's latest work downloaded to your computer.
2.  **Make Your Changes:** Edit your required code or documents locally on your machine.
3.  **Check Status Again:** Use the status checker (e.g., `git status`) to review exactly which files you've modified during your session.
4.  **Stage & Commit Changes:** "Save" or commit your changes with a brief summary message explaining what you accomplished (e.g., `git add .` followed by `git commit -m "Updated iPad scaling"`).
5.  **Push Changes:** Upload your modifications back to the central repository (e.g., `git push`) so your team members can pull them to their machines.


---

## Part 1: Global Application Changes
These items affect the overarching flow, mechanics, and data collection of the application.

### 1.1 Test Progression Order
**Current Issue:** The tests are not following the intended experimental sequence.  
**Action Item:** Update the core test progression sequence.  
- [ ] **Change the order of tests to the following sequence:**
  1. Analogy
  2. Anomaly
  3. Antinomy
  4. Antithesis

### 1.2 Data Collection Specifications (Output CSV)
**Current Issue:** The exported data log has filler metrics.  
**Action Item:** Ensure the output CSV records the following daata:

| Data Point | Description |
|---|---|
| **Seconds** | The timestamp or total running seconds tracked. |
| **Option Chosen** | Full descriptive breakdown of the animal selected (e.g., species, size, color, pattern). |
| **Total Animals Selected** | Count of all animal selections made (differentiate between selections made inside the box vs. outside the box). |
| **Total Clicks** | The total number of generalized clicks made by the user during the duration of the problem. |
| **Total Time on Problem** | Complete duration of time spent from the start of the problem to its conclusion. |
| **Time From Last Selection**| The elapsed time between the user's final answer selection and moving to the next problem. |

### 1.3 Animal Population Mechanics
**Current Issue:** The mechanics of populating options onto the screen require standardization. (Note: In Analogy, the AB box populates on startup, but the C box and question mark come second).  
**Action Items:**  
- [ ] Implement a **Hidden Button** that developers or researchers can use to manually trigger and populate the choice options.
- [ ] *Development Note:* Ensure the animals required in the problem (the main prompt) continue to come pre-populated upon loading.

---

## Part 2: Test-Specific Fixes

### 2.1 Anomaly
| Priority | Issue Description | Action/Implementation Step |
| :---: | :--- | :--- |
| **High** | **Visual Overlap (Fence)**: Animals are visually overlapping with the pen fence. | - Review and adjust padding/boundaries across problems.<br>- Manually verify: <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;• Sample Question (1 of 7) <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;• Question 2 (3 of 7) <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;• Question 3 (4 of 7) <br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;• Go through and test each remaining question. |
| **Medium** | **Extraneous Text**: Question metadata is visible to the participant. | - Remove the "Name of Test" and "Item Number" text completely from all tests and all items. |
| **High** | **Option Overlap**: Answer options (specifically large animals) overlap with each other. | - Increase the padding (spacing) between large animals in the options area to separate them visually. |

### 2.2 Analogy
| Priority | Issue Description | Action/Implementation Step |
| :---: | :--- | :--- |
| **High** | **iPad Overlap**: Animals overlap with the "Next" button on certain screens. | - Adjust the layout specifically acknowledging **iPad dimensions** so the button is clear of animal images. |
| **High** | **Sizing Inconsistency (Sheep)**: The large sheep in the "C" Box is not the same size as other large animals. | - Fix the boundary box/sizing rules for the "C" Box so the sheep matches standard "large animal" sizing. |
| **Medium** | **Baseline Misalignment**: Selected animals do not sit horizontally on the same line. | - Check and adjust the boundary box padding for the **Question Mark** box so that all animals sit on an aligned baseline. |
| **High** | **General Sizing Issues**: The Choices Box is too small, creating multiple sizing issues. | - Increase the size of the *Analogy Choices Box* by roughly 75%. <br>- **Constraint:** Do not make it bigger than the Green Box found in the Antinomy test. |

### 2.3 Antithesis
| Priority | Issue Description | Action/Implementation Step |
| :---: | :--- | :--- |
| **High** | **Visual Overlap (Railings)**: Animals look like they are sitting on top of the pen railings. | - Adjust the visual positioning so animals are clearly inside the pen (similar to the Anomaly overlap issue). |
| **High** | **Pen Capacity**: The problem pens are too small. | - Enlarge the problem pens to comfortably accommodate up to **3 LARGE animals**. |
| **Critical** | **Screen Persistence Bug**: Final selected animal(s) remain stuck on screen after the test ends and show up on the Opening Screen of the next test (Antinomy). | - Force the screen to clear elements completely at test end.<br>- *Diagnostic check:* Verify if this bug affects all tests globally or is localized to Antithesis.<br>- **REMOVE ARROWS.** |
| **Medium** | **Proportional Distortion**: Animal sizes appear distorted. | - Check the resizing logic in this test. Ensure nothing is breaking the "standard sizing" that persists across all other games. |
| **Medium** | **Choices Box Spacing**: Uneven distance between animals. | - Adjust the spacing in the Choices Box so that the horizontal distance between animals matches the proportional distance used in the answer box. |
| **Global Focus** | **Baseline Standardization**: Varied vertical alignments. | - Standardize baselines across all three game boxes AND the animal sets in the choices box. |

### 2.4 Antinomy
| Priority | Issue Description | Action/Implementation Step |
| :---: | :--- | :--- |
| **High** | **Question Mark Placement**: The Question Mark is positioned too far to the right. | - Shift the Question Mark so it sits in the exact space where a selected animal will eventually cover it. |
| **High** | **Pen Misalignment**: Baselines in the Green Box are higher than the Red Box, pushing animals outside the pen. | - Adjust the padding of the Green Box so that its resulting baseline (bottom floor for the animals) matches the alignment in the Red Box. |

---

## Implementation Guidelines for the Team

Issues/ideas to consider + Important Definitions:
* **Testing Device:** Unsure if we are going to move forward with iPads or not.
* **Baselines:** A "Baseline" refers to the invisible horizontal floor that the animals' feet rest on. When "standardizing baselines," the goal is to align their feet horizontally so characters don't look like they are floating or sinking.
* **Padding vs. Margin vs. Boundary Box:** 
  * *Boundary Box:* Think of this as the invisible container holding the animal or group of animals.
  * *Padding:* The empty space *inside* a container. If animals are touching fences, increasing padding pushes them away from the edges. 
  * *Proportions:* Use proportional sizes (percentages) rather than fixed static sizes where possible to keep animals consistent across screens.

---

## Part 3: Next Steps & Deployment

### 3.1 Device Compatibility & Display
*   **Goal:** Ensure the website is fully accessible and functioning correctly on iPad displays (11-inch vs. 13-inch specific sizes to be discussed in the lab).
*   **Action Item:** Modify code depending on the final iPad choice to guarantee optimal display functionality.

### 3.2 Website Domain Setup
*   **Domain Options:**
    *   `TORREC.com`
    *   `TestofRelationalReasoning.com`
    *   `TORR-ec.com`
*   **Cost Estimate:** ~$10/year.
*   **Action Item:** Discuss options with the group and finalize registration.

### 3.3 Website File Upload & Version Control
*   **Deployment Method:** Updates will most likely be deployed via Git.
---

## Part 4: Domain & Server Compliance Status

**Current Status:** Awaiting guidance from Research Security and IT Research Consulting.

*Contact has been initiated with the IT Compliance Team (who have forwarded the inquiry to specialized research teams) regarding IT and data security requirements. The initial plan proposed utilizing an independent domain and encrypted storage via a secure AWS cloud server, ensuring no data is stored locally. Before finalizing the setup or submitting the protocol to the IRB, we are awaiting clarification on the following items:*

*   **Domain and Enterprise Agreements:** Verifying whether a `.umd.edu` extension is required to utilize UMD-provided domains or to access university AWS enterprise agreements.
*   **Cloud Hosting Compliance:** Confirming if the chosen encrypted cloud setup (AWS/HTTPS) is permissible, or if the project requires a specific AWS account provisioned through DIT rather than a standard external account.
*   **Authentication Protocols:** Determining what specific protocols and qualifications are needed to securely integrate university registration or single sign-on (SSO) for the participants/administrators.
