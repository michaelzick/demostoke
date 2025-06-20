
import { BlogPost } from './types';

export const skateboardsPosts: Omit<BlogPost, 'author' | 'authorId'>[] = [
  {
    id: "skateboard-setup-guide",
    title: "Complete Skateboard Setup Guide: Build Your Perfect Ride",
    excerpt: "Learn how to assemble and customize your skateboard from scratch. Our comprehensive guide covers deck selection, truck tuning, wheel choice, and bearing maintenance.",
    content: `Building your own skateboard setup allows you to customize every component for your specific riding style and preferences. Understanding how each part affects performance will help you create the perfect board for your needs.

**Essential Skateboard Components**

**Deck Selection**

The foundation of your setup, skateboard decks vary in size, shape, and construction:

**Size Considerations:**

- Width: 7.5" - 8.75" (most common range)
- Length: 29" - 33" (varies with width and brand)
- Wheelbase: Distance between truck mounting holes

**Width Guidelines:**

- 7.5" - 7.75": Street skating, technical tricks
- 7.75" - 8.25": Versatile for street and park
- 8.25" - 8.5": Park, bowl, and transition skating
- 8.5"+: Cruising, old school, and big feet

**Deck Construction:**

- 7-ply maple: Standard construction, good durability
- 8-ply or 9-ply: Extra strength for heavy riders
- Bamboo core: Lighter weight, flexible feel
- Carbon fiber: Premium strength and pop

**Shape Variations:**

- Popsicle: Modern symmetrical shape
- Old school: Wider, more pointed nose
- Cruiser: Longer, often with kicktail only
- Shaped boards: Unique outlines for specific styles

**Truck Selection and Setup**

**Truck Basics**

Trucks connect your wheels to your deck and allow for turning. Key measurements include:
- Axle width should match deck width
- Standard truck widths: 139mm, 144mm, 149mm, 159mm, 169mm
- Height affects ride feel and wheel clearance

**Truck Components:**

- Baseplate: Mounts to deck, determines turning geometry
- Hanger: Holds axles and affects turn radius
- Kingpin: Central bolt that holds truck together
- Bushings: Urethane cushions that control turn feel
- Pivot cup: Allows smooth truck rotation

**Bushing Selection:**

Bushings dramatically affect how your board turns:
- Soft bushings (78A-87A): Loose, surfy feel
- Medium bushings (88A-92A): Balanced performance
- Hard bushings (93A-100A): Stable, less turn

**Truck Tuning:**

- Kingpin tightness: Looser for carving, tighter for stability
- Front/rear balance: Many prefer slightly looser front truck
- Bushing combinations: Mix durometer for custom feel
- Regular maintenance: Check tightness and wear

**Wheel Selection**

**Wheel Specifications**

Wheels affect speed, grip, and trick performance:
- Diameter: 50mm-60mm+ (measured in millimeters)
- Durometer: Hardness rated on A-scale (78A-101A)
- Contact patch: Width of wheel touching ground
- Core placement: Affects acceleration and roll speed

**Size Guidelines:**

- 50mm-53mm: Street skating, technical tricks
- 54mm-56mm: Versatile street/park riding
- 57mm-60mm: Cruising, rough surfaces
- 60mm+: Longboarding, transportation

**Hardness Selection:**

- 78A-87A: Soft, smooth ride, good grip
- 88A-95A: Medium, versatile performance
- 96A-101A: Hard, fast, good for tricks

**Wheel Shapes:**

- Rounded edges: Better for sliding and tricks
- Square edges: Maximum grip and contact
- Beveled edges: Compromise between round and square

**Bearing Installation and Maintenance**

**Bearing Basics**

Skateboard bearings use ABEC rating system:
- ABEC 3: Basic quality, adequate for most riders
- ABEC 5: Good quality, smooth rolling
- ABEC 7: High quality, precision construction
- ABEC 9: Premium quality, racing precision

**Bearing Installation:**

- Press bearings fully into wheel
- Use bearing tool or truck axle for installation
- Ensure bearings sit flush with wheel
- Install bearing spacers if using them

**Maintenance Schedule:**

- Clean bearings every 2-3 months
- Replace when worn or contaminated
- Use appropriate lubricants (bearing oil or grease)
- Protect from water and dirt exposure

**Hardware and Accessories**

**Mounting Hardware**

- Bolts: 7/8" for standard setups, 1" with shock pads
- Phillips or Allen head options
- Colored hardware for customization
- Thread locker for loose bolt prevention

**Optional Components:**

- Shock pads: Reduce vibration and board stress
- Riser pads: Increase height and prevent wheel bite
- Rail guards: Protect deck during grinds
- Tail guards: Prevent tail wear from dragging

**Assembly Process**

**Step-by-Step Setup**

1. Apply grip tape to deck (if not pre-gripped)
2. Mark and drill truck mounting holes
3. Install trucks with mounting hardware
4. Install bearings in wheels
5. Mount wheels to trucks
6. Final tuning and adjustment

**Tools Needed:**

- Skate tool or basic wrenches
- Razor blade for grip tape
- Drill with bits (if needed)
- Bearing press or installation tool

**Tuning Your Setup**

**Personal Preferences**

- Truck tightness affects turning radius
- Wheel hardness impacts ride quality
- Deck concave influences foot feel
- Overall setup weight affects trick performance

**Common Adjustments:**

- Loosen trucks for cruising comfort
- Tighten trucks for technical skating
- Experiment with different wheel combinations
- Adjust hardware tightness regularly

**Maintenance and Care**

**Regular Inspections**

- Check hardware tightness weekly
- Inspect deck for stress cracks
- Monitor wheel wear patterns
- Clean bearings when performance drops

**Replacement Schedule**

- Wheels: When worn flat or chunked
- Bearings: Every 6-12 months depending on use
- Bushings: When compressed or torn
- Deck: When delaminated or cracked

**Customization Ideas**

**Aesthetic Mods**

- Colored grip tape designs
- Custom deck graphics
- Matching hardware colors
- Unique wheel combinations

**Performance Mods**

- Mixed wheel hardness setups
- Different bushing combinations
- Specialized bearing upgrades
- Weight-optimized components

**Building Multiple Setups**

**Setup Specialization**

- Street setup: Hard wheels, tight trucks
- Cruiser setup: Soft wheels, loose trucks
- Park setup: Medium wheels, balanced tuning
- Travel setup: Compact, lightweight components

**Budget Considerations**

- Start with quality basics
- Upgrade components gradually
- Buy complete setups for beginners
- Invest in tools for long-term savings

Building the perfect skateboard setup is a personal journey that evolves with your skills and preferences. Start with quality basics, experiment with different components, and don't be afraid to make adjustments. The best setup is one that feels right under your feet and inspires you to keep pushing your limits.

Remember that no single setup works for everyone - what matters is finding the combination that works best for your skating style, local terrain, and personal preferences.`,
    category: "skateboards",
    publishedAt: "2025-01-09",
    readTime: 11,
    heroImage: "https://images.unsplash.com/photo-1578616736926-b8513bbe2fde?auto=format&fit=crop&w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1578616736926-b8513bbe2fde?auto=format&fit=crop&w=400&q=80",
    tags: ["skateboards", "setup", "guide", "customization", "maintenance"]
  },
  {
    id: "skateboard-trick-progression",
    title: "Skateboard Trick Progression: From Ollie to Advanced Street Skills",
    excerpt: "Master skateboarding fundamentals with our complete trick progression guide. Learn proper technique, common mistakes, and practice methods for building skills systematically.",
    content: `Learning skateboard tricks requires patience, persistence, and proper progression. This comprehensive guide breaks down the essential tricks every skater should master, from basic ollies to advanced street maneuvers.

**Foundation Skills**

**Stance and Board Control**

Before attempting tricks, master these fundamentals:

**Regular vs. Goofy Stance**

- Regular: Left foot forward, push with right foot
- Goofy: Right foot forward, push with left foot
- Test by having someone push you from behind - whichever foot you step forward with is your front foot

**Basic Riding Skills**

- Comfortable pushing and riding
- Turning and carving
- Stopping safely (foot brake, tail drag)
- Riding over small obstacles
- Balance while stationary

**Kick Turn Fundamentals**

- Stationary kick turns on flat ground
- Rolling kick turns at slow speed
- Transitioning between kick turns
- Using kick turns to navigate tight spaces

**The Ollie: Foundation of Modern Skateboarding**

**Understanding the Ollie**

The ollie is the basis for nearly every modern skateboard trick. It involves jumping while making the board follow your feet off the ground.

**Step-by-Step Breakdown**

**Foot Position:**

- Back foot: Ball of foot on tail edge
- Front foot: Just behind front bolts, perpendicular to board
- Weight slightly forward, knees bent

**The Motion:**

1. Crouch down with knees bent
2. Jump up while snapping tail down hard
3. Slide front foot forward and up the board
4. Level out board by pushing front foot forward
5. Land with both feet over bolts

**Common Ollie Mistakes**

- Not jumping high enough
- Sliding front foot too early
- Not snapping tail hard enough
- Leaning too far back or forward
- Not committing to the motion

**Practice Progression:**

1. Practice tail snaps while stationary
2. Practice the sliding motion without jumping
3. Combine snap and slide while stationary
4. Attempt rolling ollies at slow speed
5. Build height and consistency

**Basic Trick Progression**

**Level 1: Fundamental Tricks**

**Shuvit (Pop Shuvit)**

- Scoop tail backward while jumping
- Board rotates 180 degrees
- Land back on board
- Focus on consistent scoop motion

**Frontside 180**

- Ollie while rotating body and board frontside
- Turn shoulders and hips in direction of rotation
- Spot your landing
- Practice body rotation separately first

**Backside 180**

- Ollie while rotating backside
- More blind rotation, requires commitment
- Use shoulder wind-up for momentum
- Practice on transition first

**Level 2: Intermediate Tricks**

**Kickflip**

- Ollie motion with flick of front toe
- Board flips between your legs
- Catch with feet and land
- Start with stationary practice

**Heelflip**

- Ollie with heel flick instead of toe
- Opposite rotation from kickflip
- Keep shoulders square
- Practice heel flick motion first

**Pop Shuvit**

- More aggressive version of shuvit
- Higher pop, more scoop
- Board stays level while rotating
- Foundation for advanced shuvit variations

**Level 3: Advanced Street Tricks**

**Tre Flip (360 Flip)**

- Combines kickflip and 360 shuvit
- Extremely technical, requires perfect timing
- Flick and scoop simultaneously
- High commitment level required

**Hardflip**

- Kickflip with frontside shuvit
- Vertical board rotation
- Difficult catch timing
- Master kickflips and shuvits first

**Inward Heelflip**

- Heelflip with backside shuvit
- Board flips inward toward body
- Unique catch timing
- Advanced foot positioning required

**Grinding and Sliding Fundamentals**

**Basic Grinds**

**50-50 Grind**

- Both trucks on rail or ledge
- Approach at slight angle
- Lock in with centered weight
- Look ahead, not down

**5-0 Grind**

- Back truck only on obstacle
- Front truck lifted
- Balance point over back truck
- Practice tail stalls first

**Boardslide**

- Board perpendicular to obstacle
- Slide on board's middle
- Approach with speed and commitment
- Wax obstacles for better slides

**Lipslide**

- Similar to boardslide but approach from other side
- More difficult entry
- Requires precise timing
- Master boardslides first

**Building Consistency**

**Practice Methods**

**Session Structure**

- Warm up with basic riding
- Practice fundamentals daily
- Focus on one new trick per session
- End with tricks you can already do

**Mental Approach**

- Visualize tricks before attempting
- Break complex tricks into components
- Accept failure as part of learning
- Celebrate small progressions

**Physical Preparation**

- Stretch before skating
- Build leg and core strength
- Practice balance exercises
- Stay hydrated and rested

**Common Progression Mistakes**

**Skipping Fundamentals**

- Rushing to advanced tricks
- Ignoring basic board control
- Poor ollie technique
- Inconsistent stance

**Bad Practice Habits**

- Practicing only easy tricks
- Not filming to analyze technique
- Skating alone without feedback
- Focusing only on landing, not style

**Safety and Injury Prevention**

**Protective Gear**

- Helmet for bowl and vert skating
- Knee pads for learning new tricks
- Wrist guards for beginners
- Proper skate shoes for board feel

**Smart Progression**

- Learn tricks in logical order
- Master basics before advancing
- Understand your limits
- Take breaks to prevent overuse injuries

**Troubleshooting Common Issues**

**Ollie Problems**

- Low ollies: Jump higher, snap harder
- Uneven ollies: Work on front foot slide
- Inconsistent: Focus on timing and muscle memory
- Sketchy landings: Practice stationary first

**Flip Trick Issues**

- Under-rotation: Stronger flick
- Over-rotation: Lighter flick
- Poor catch: Watch board and commit
- Inconsistent: Slow down and focus on form

**Finding Your Style**

**Individual Expression**

- Develop your own approach to tricks
- Focus on clean execution over quantity
- Find spots that inspire you
- Watch diverse skaters for inspiration

**Building Video Parts**

- Document your progression
- Work on trick combinations
- Develop signature spots
- Focus on style and flow

Skateboard trick progression is a lifelong journey that rewards patience and persistence. Focus on building a solid foundation before advancing to more complex maneuvers. Remember that every professional skater started with basic ollies and worked their way up through consistent practice and determination.

The key to successful progression is understanding that skateboarding is both physical and mental. Master the fundamentals, stay committed to the process, and enjoy the journey of constant improvement.`,
    category: "skateboards",
    publishedAt: "2025-01-07",
    readTime: 13,
    heroImage: "https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?auto=format&fit=crop&w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1520175480921-4edfa2983e0f?auto=format&fit=crop&w=400&q=80",
    tags: ["skateboards", "tricks", "progression", "technique", "fundamentals"]
  }
];
