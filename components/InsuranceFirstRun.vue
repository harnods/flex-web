<!--
  Mekari Flex — Insurance · First-run onboarding (Story 1 entry)
  Source: Figma kfMgM67rMIHKODjNnnqGpG / 9483:55078 · Pixel 3 DT 2.4
  Shown when no insurance plans exist. CTA navigates to the import flow.
  Pixel components only; css() (tokens) for the hero/step framing, no raw CSS.
  ASSET NOTE: Figma hero uses a 3D illustration + step thumbnails — placeholders
  here use tinted icon tiles; drop real art into /public and swap the tiles.
-->
<script setup lang="ts">
import { MpFlex, MpText, MpButton, MpTextlink, css } from '@mekari/pixel3'

const COPY = {
  heroTitle: 'Digitize your employee insurance management',
  heroBody:
    'Import health plans, assign default coverage based on job grades, and streamline the enrollment process for your employees—all in one place.',
  cta: 'Import insurance plan',
  steps: [
    {
      label: 'Step 1', icon: 'download',
      title: 'Import insurance plans',
      body: 'Set up your insurance plans by downloading a template, filling in your plan details, and uploading it.',
      points: [
        ['Download the template:', 'Get the pre-formatted file to fill in your plan details.'],
        ['Fill in the template:', 'Add coverage type, premium value, and benefits for each plan.'],
        ['Upload the file:', 'Import the completed template to add your plans to the system.'],
      ],
    },
    {
      label: 'Step 2', icon: 'profile',
      title: 'Configure enrollment & assignment',
      body: 'Once plans are created, assign them to your workforce.',
      points: [
        ['Set Defaults:', 'Assign default plans automatically based on employee Job Grades.'],
        ['Enrollment Window:', 'Open the enrollment period for employees to view or upgrade their plans via the app.'],
        ['Finalize:', 'Review and approve the final enrollment list.'],
      ],
    },
  ],
  helpPrefix: 'Need help to set up? ',
  helpLink: 'Reach out to our customer success team',
  helpSuffix: ' for assistance.',
}

const hero = css({
  position: 'relative', overflow: 'hidden', borderRadius: 'lg', minHeight: '232px',
  background: 'linear-gradient(90deg, token(colors.background.success) 0%, token(colors.background.neutral) 60%)',
  borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default',
})
const heroArt = css({
  position: 'absolute', right: '32px', top: '50%', transform: 'translateY(-50%)',
  width: '160px', height: '160px', borderRadius: 'full',
  background: 'background.brand.selected',
})
const stepCard = css({
  borderRadius: 'lg', borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default',
  background: 'background.neutral',
})
const stepThumb = css({
  flexShrink: 0, width: '140px', height: '92px', borderRadius: 'md',
  background: 'background.surface', borderWidth: '1px', borderStyle: 'solid', borderColor: 'border.default',
})
</script>

<template>
  <MpFlex direction="column" gap="6">
    <!-- Hero -->
    <MpFlex :class="hero" align="center" padding="8">
      <MpFlex direction="column" gap="4" maxWidth="440px" zIndex="1">
        <MpText as="h2" size="h2" weight="semiBold" color="text.default">{{ COPY.heroTitle }}</MpText>
        <MpText size="body" color="text.secondary">{{ COPY.heroBody }}</MpText>
        <MpFlex>
          <MpButton variant="primary" size="md" @click="navigateTo('/insurance/plans/import')">
            {{ COPY.cta }}
          </MpButton>
        </MpFlex>
      </MpFlex>
      <MpFlex :class="heroArt" align="center" justify="center" aria-hidden="true">
        <PxIcon name="protection" :size="32" variant="duotone" color="icon.brand" />
      </MpFlex>
    </MpFlex>

    <!-- Two-step explainer -->
    <MpFlex direction="column" gap="4">
      <MpFlex v-for="step in COPY.steps" :key="step.title" :class="stepCard" gap="4" padding="5">
        <MpFlex :class="stepThumb" align="center" justify="center" aria-hidden="true">
          <PxIcon :name="step.icon" :size="28" color="icon.secondary" />
        </MpFlex>
        <MpFlex direction="column" gap="2" minWidth="0">
          <MpText size="body-small" color="text.secondary">{{ step.label }}</MpText>
          <MpText size="label" weight="semiBold" color="text.default">{{ step.title }}</MpText>
          <MpText size="body-small" color="text.secondary">{{ step.body }}</MpText>
          <MpFlex direction="column" gap="1" paddingTop="1">
            <MpFlex v-for="(p, i) in step.points" :key="i" align="flex-start" gap="2">
              <PxIcon name="indicator-circle" :size="16" color="icon.secondary" />
              <MpFlex wrap="wrap" gap="1">
                <MpText size="body-small" weight="semiBold" color="text.default">{{ p[0] }}</MpText>
                <MpText size="body-small" color="text.secondary">{{ p[1] }}</MpText>
              </MpFlex>
            </MpFlex>
          </MpFlex>
        </MpFlex>
      </MpFlex>
    </MpFlex>

    <!-- Help footer -->
    <MpFlex align="center" justify="center" gap="1" paddingBlock="2">
      <PxIcon name="help" :size="16" color="icon.secondary" />
      <MpText size="body-small" color="text.secondary">{{ COPY.helpPrefix }}</MpText>
      <MpTextlink href="#">{{ COPY.helpLink }}</MpTextlink>
      <MpText size="body-small" color="text.secondary">{{ COPY.helpSuffix }}</MpText>
    </MpFlex>
  </MpFlex>
</template>
