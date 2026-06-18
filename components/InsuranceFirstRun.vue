<!--
  Mekari Flex — Insurance · First-run onboarding (before any plan exists)
  Source: Figma kfMgM67rMIHKODjNnnqGpG / 9480:54671 · Pixel 3 DT 2.4
  Shown when no insurance plans exist. CTA navigates to the import flow.
  Pixel components + css() tokens for the hero/step framing; no raw <style>.
  Hero art = real Figma assets (woman + shield) in /public/illustrations;
  the "Set up plans" widget and the step thumbnails are rebuilt with Pixel.
-->
<script setup lang="ts">
import { Pixel, MpFlex, MpText, MpButton, MpTextlink, css } from '@mekari/pixel3'

const COPY = {
  heroTitle: 'Digitize your employee insurance management',
  heroBody:
    'Import health plans, assign default coverage based on job grades, and streamline the enrollment process for your employees—all in one place.',
  cta: 'Import insurance plan',
  steps: [
    {
      label: 'Step 1', thumb: '/illustrations/step-1-import.png',
      title: 'Import insurance plans',
      body: 'Set up your insurance plans by downloading a template, filling in your plan details, and uploading it.',
      points: [
        ['Download the template:', 'Get the pre-formatted file to fill in your plan details.'],
        ['Fill in the template:', 'Add coverage type, premium rules, and benefits for each plan.'],
        ['Upload the file:', 'Import the completed template to add your plans to the system.'],
      ],
    },
    {
      label: 'Step 2', thumb: '/illustrations/step-2-configure.png',
      title: 'Configure enrollment & assignment',
      body: 'Once plans are created, assign them to your workforce.',
      points: [
        ['Set Defaults:', 'Assign default plans automatically based on employee Job Grades.'],
        ['Enrollment Window:', 'Open the enrollment period for employees to view or upgrade their plans via the app.'],
        ['Finalize:', 'Review and approve the final participant list.'],
      ],
    },
  ],
  helpPrefix: 'Need help to set up? ',
  helpLink: 'Reach out to our customer success team',
  helpSuffix: ' for assistance.',
}

// Full-bleed against the layout stage (which pads 24px on all sides).
const root = css({ marginTop: '-6', marginInline: '-6' })

const hero = css({
  position: 'relative', overflow: 'hidden',
  background: 'background.success',
  height: '420px',
  paddingInline: '12', gap: '8',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  borderTopLeftRadius: 'md',
})
const heroCol = css({ display: 'flex', flexDirection: 'column', gap: '6', maxWidth: '440px', flexShrink: 0 })
// Natural size, anchored to the bottom of the hero. Never shrinks — it's
// removed entirely on tablet/mobile where it won't fit.
const heroImg = css({
  width: '531px', height: '420px', flexShrink: 0, alignSelf: 'flex-end', display: 'block',
  '@media (max-width: 1024px)': { display: 'none' },
})

const stepsWrap = css({
  display: 'flex', flexDirection: 'column', gap: '6', alignItems: 'center',
  paddingInline: '6', paddingBlock: '10',
})
const stepRow = css({ display: 'flex', gap: '6', width: '100%', maxWidth: '880px', alignItems: 'flex-start' })
const thumbImg = css({ flexShrink: 0, width: '202px', height: '180px', objectFit: 'contain' })

const footer = css({
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2',
  borderTopWidth: '1px', borderTopStyle: 'solid', borderTopColor: 'border.default',
  marginInline: '6', paddingTop: '5', paddingBottom: '20',
})
</script>

<template>
  <MpFlex :class="root" direction="column">
    <!-- ── Hero ─────────────────────────────────────────────────────────── -->
    <div :class="hero">
      <div :class="heroCol">
        <MpFlex direction="column" gap="2">
          <MpText as="h1" size="h1" weight="semiBold" color="text.default">{{ COPY.heroTitle }}</MpText>
          <MpText size="body" color="text.default">{{ COPY.heroBody }}</MpText>
        </MpFlex>
        <MpFlex>
          <MpButton variant="primary" size="md" @click="navigateTo('/insurance/plans/import')">
            {{ COPY.cta }}
          </MpButton>
        </MpFlex>
      </div>

      <Pixel.img :class="heroImg" src="/illustrations/insurance-hero.png" alt="" aria-hidden="true" />
    </div>

    <!-- ── Two-step explainer ──────────────────────────────────────────── -->
    <div :class="stepsWrap">
      <div v-for="step in COPY.steps" :key="step.title" :class="stepRow">
        <!-- Thumbnail -->
        <Pixel.img :class="thumbImg" :src="step.thumb" alt="" aria-hidden="true" />

        <!-- Text -->
        <MpFlex direction="column" gap="3" minWidth="0" flex="1">
          <MpFlex direction="column">
            <MpText size="label-small" weight="semiBold" color="text.secondary">{{ step.label }}</MpText>
            <MpText size="h2" weight="semiBold" color="text.default">{{ step.title }}</MpText>
          </MpFlex>
          <MpText size="body" color="text.default">{{ step.body }}</MpText>
          <Pixel.ul :class="css({ paddingLeft: '4', listStyleType: 'disc' })">
            <Pixel.li v-for="(p, i) in step.points" :key="i">
              <MpText as="span" size="body" weight="semiBold" color="text.default">{{ p[0] }}</MpText>
              <MpText as="span" size="body" color="text.default"> {{ p[1] }}</MpText>
            </Pixel.li>
          </Pixel.ul>
        </MpFlex>
      </div>
    </div>

    <!-- ── Help footer ─────────────────────────────────────────────────── -->
    <div :class="footer">
      <PxIcon name="help" :size="20" color="icon.secondary" />
      <MpText size="body" color="text.default">{{ COPY.helpPrefix }}</MpText>
      <MpTextlink href="#">{{ COPY.helpLink }}</MpTextlink>
      <MpText size="body" color="text.default">{{ COPY.helpSuffix }}</MpText>
    </div>
  </MpFlex>
</template>
