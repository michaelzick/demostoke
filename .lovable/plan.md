
## Remove Captcha from Admin Create New User Form

### Every captcha touchpoint found

| File | What needs changing |
|------|-------------------|
| `src/components/HCaptcha.tsx` | Can be left in place (used elsewhere) but no longer imported in the form |
| `src/components/admin/UserCreationFormActions.tsx` | Remove `HCaptcha` import, `hcaptchaRef`, `onCaptchaVerify` prop, `shouldResetCaptcha` prop, and the `<HCaptcha>` JSX. Update footer text. |
| `src/hooks/user-creation/useUserCreationForm.ts` | Remove `captchaToken` state, `shouldResetCaptcha` state, `handleCaptchaVerify`, `resetCaptcha` (or make it a no-op). Stop returning them. |
| `src/hooks/user-creation/useUserCreationValidation.ts` | Remove `captchaToken` parameter from the function signature and from the `baseValid` check. |
| `src/hooks/user-creation/index.ts` | Remove `captchaToken`, `shouldResetCaptcha`, `handleCaptchaVerify`, `resetCaptcha` from the hook's destructuring and return. Pass empty string or remove `captchaToken` arg from `createUserSubmission`. |
| `src/hooks/user-creation/useUserCreationSubmission.ts` | Remove `captchaToken` parameter from `createUser`. Remove it from `supabase.auth.signUp` options. Remove the `captcha`-related error handler. Update the validation error message to remove captcha mention. Remove `resetCaptcha` calls on validation failures (keep the error reset call on caught errors as a no-op or remove). |
| `src/components/admin/ManualUserCreationSection.tsx` | Remove `shouldResetCaptcha` and `handleCaptchaVerify` from the destructure. Remove those props from `<UserCreationFormActions>`. Update `CardDescription` text to remove captcha mention. |

### Summary of logic changes

**Validation** (`useUserCreationValidation.ts`): Drop `captchaToken` from the signature and from `baseValid`. Form becomes valid as soon as name + email + password (≥6 chars) + role + gearCategory (when required) are filled.

**Submission** (`useUserCreationSubmission.ts`): Drop `captchaToken` from the function signature and remove `captchaToken` from the `supabase.auth.signUp` options object. Remove the captcha-specific `catch` branch. Remove the two `resetCaptcha()` calls in the early-exit validation blocks.

**Form state** (`useUserCreationForm.ts`): Delete the `captchaToken` and `shouldResetCaptcha` states entirely, along with `handleCaptchaVerify` and `resetCaptcha`.

**Form actions UI** (`UserCreationFormActions.tsx`): Drop the `onCaptchaVerify` and `shouldResetCaptcha` props from the interface and component. Remove the `HCaptcha` import, `useRef` import, `hcaptchaRef`, and the `<HCaptcha>` JSX block. Change the footer note to: `* Required fields. Fill in all required fields and the user will receive an email confirmation.`

**Parent section** (`ManualUserCreationSection.tsx`): Remove `shouldResetCaptcha` and `handleCaptchaVerify` from the hook destructure. Remove those two props from `<UserCreationFormActions>`. Change the `CardDescription` to remove the captcha mention.

**Index hook** (`index.ts`): Clean up — stop passing `captchaToken` and `resetCaptcha` into `createUserSubmission`, stop returning them.

No other files reference the captcha in this flow. The `HCaptcha.tsx` component file itself is left untouched since it may be used in other contexts (e.g., public sign-up).
