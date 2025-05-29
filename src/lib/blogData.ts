export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  publishedAt: string;
  readTime: number;
  heroImage: string;
  thumbnail: string;
  tags: string[];
}

export const blogPosts: BlogPost[] = [
  {
    id: "snowboarding-powder-tips",
    title: "Mastering Powder: Essential Tips for Deep Snow Snowboarding",
    excerpt: "Learn the techniques and gear choices that will transform your powder riding experience from struggling to floating effortlessly through deep snow.",
    content: `There's nothing quite like the feeling of floating through untouched powder snow on your snowboard. But mastering powder riding requires specific techniques and the right equipment setup.

**Understanding Powder Physics**
Powder snow behaves differently than groomed runs. The key is learning to surf the snow rather than carve through it. Your board needs to plane on top of the snow, which requires proper weight distribution and timing.

**Essential Techniques:**
- Keep your weight centered and slightly back
- Make flowing, rhythmic turns rather than sharp carves
- Use your whole body to initiate turns, not just your legs
- Maintain momentum - speed is your friend in powder

**Board Setup Considerations:**
For powder riding, consider a longer board with a setback stance. This helps the nose stay up and improves float. A directional shape with a tapered tail also enhances powder performance.

**Gear Recommendations:**
- Powder-specific boards: Look for boards 5-10cm longer than your all-mountain board
- Bindings: Set them back 1-2cm from center
- Boots: Stiffer boots provide better control in deep snow

**Safety First:**
Always check avalanche conditions and carry proper safety equipment including beacon, probe, and shovel when riding in backcountry powder.

The learning curve for powder can be steep, but once you get it, you'll understand why powder days are the most sought-after conditions on the mountain.`,
    category: "snowboards",
    author: "Jake Morrison",
    publishedAt: "2024-01-15",
    readTime: 5,
    heroImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400&q=80",
    tags: ["powder", "technique", "gear", "backcountry"]
  },
  {
    id: "ski-touring-beginners-guide",
    title: "Ski Touring for Beginners: Your Gateway to Backcountry Adventure",
    excerpt: "Discover the world of ski touring with our comprehensive guide covering essential gear, basic techniques, and safety considerations for your first backcountry adventures.",
    content: `Ski touring opens up a world of untouched snow and pristine mountain experiences beyond the bounds of ski resorts. Here's everything you need to know to get started safely.

**What is Ski Touring?**
Ski touring, also known as alpine touring (AT) or backcountry skiing, involves hiking uphill on skis using special bindings and boots, then skiing down ungroomed terrain.

**Essential Gear:**
- **Touring Skis:** Lighter than resort skis, often with special mounting points
- **AT Bindings:** Allow your heel to lift for uphill travel
- **Touring Boots:** Hybrid design with walk mode for uphill and ski mode for downhill
- **Climbing Skins:** Attach to ski bases for uphill traction
- **Safety Gear:** Avalanche beacon, probe, shovel are non-negotiable

**Basic Techniques:**
The uphill technique involves a sliding motion rather than lifting your skis. Keep your weight forward and use your poles for balance and propulsion.

**Planning Your First Tour:**
- Start with short, low-angle tours
- Choose familiar terrain
- Check weather and avalanche conditions
- Go with experienced partners or hire a guide

**Fitness Considerations:**
Touring is physically demanding. Build cardiovascular fitness and leg strength before your first tour. Start with resort-accessed sidecountry before committing to full backcountry tours.

**Environmental Responsibility:**
Practice Leave No Trace principles and respect wildlife habitats. Timing is crucial - avoid sensitive areas during wildlife breeding seasons.

Ski touring combines the best of hiking and skiing, offering access to some of the most beautiful mountain terrain. Take it slow, prioritize safety, and you'll discover a lifetime passion.`,
    category: "skis",
    author: "Sarah Chen",
    publishedAt: "2024-02-03",
    readTime: 7,
    heroImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400&q=80",
    tags: ["touring", "backcountry", "beginners", "safety", "gear"]
  },
  {
    id: "surfboard-selection-guide",
    title: "Finding Your Perfect Wave Rider: A Complete Surfboard Selection Guide",
    excerpt: "From shortboards to longboards, learn how to choose the right surfboard for your skill level, local waves, and surfing goals.",
    content: `Choosing the right surfboard can make or break your surfing experience. With countless shapes, sizes, and construction options available, here's how to find your perfect wave rider.

**Understanding Board Types:**

**Longboards (8'6" - 12'+):**
Perfect for beginners and those who love the classic surfing style. Offer stability, paddle power, and the ability to catch waves early.

**Shortboards (5'6" - 6'8"):**
High-performance boards for experienced surfers. Designed for critical waves and progressive maneuvers.

**Mid-length Boards (6'8" - 8'6"):**
The sweet spot for many surfers - easier to paddle than shortboards but more maneuverable than longboards.

**Fish Boards:**
Short, wide, and thick - perfect for smaller, weaker waves. Great for generating speed in less powerful surf.

**Key Factors to Consider:**

**Your Skill Level:**
- Beginner: Longer, wider, thicker boards with more foam
- Intermediate: Mid-length boards as you develop skills
- Advanced: Shorter, more responsive boards for performance

**Local Wave Conditions:**
- Small, weak waves: Fish or longboard
- Medium waves: Mid-length or shortboard
- Large, powerful waves: Gun or step-up board

**Your Physical Attributes:**
Taller, heavier surfers generally need more volume and length. Use online volume calculators as a starting point.

**Construction Types:**
- **Polyurethane (PU):** Traditional construction, forgiving feel
- **Epoxy:** Lighter, more buoyant, great for beginners
- **Carbon Fiber:** High-performance, responsive

**Pro Tips:**
- Don't ego-surf - choose boards that suit your actual ability
- Consider renting different boards before buying
- Local shapers understand your waves best
- A good board can last decades with proper care

Remember, there's no perfect board for everyone. The best surfboard is the one that gets you stoked to paddle out and helps you progress your surfing.`,
    category: "surfboards",
    author: "Miguel Rodriguez",
    publishedAt: "2024-02-20",
    readTime: 6,
    heroImage: "https://images.unsplash.com/photo-1502933691298-84fc14542831?auto=format&fit=crop&w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1502933691298-84fc14542831?auto=format&fit=crop&w=400&q=80",
    tags: ["surfboards", "selection", "beginners", "waves", "equipment"]
  },
  {
    id: "sup-yoga-benefits",
    title: "SUP Yoga: Finding Balance on Water for Mind, Body, and Soul",
    excerpt: "Explore how stand-up paddleboard yoga combines the benefits of traditional yoga with the challenges and serenity of practicing on water.",
    content: `Stand-up paddleboard (SUP) yoga has emerged as one of the most rewarding ways to deepen your yoga practice while connecting with nature. Here's why SUP yoga might be your next favorite activity.

**What Makes SUP Yoga Special?**

Practicing yoga on a floating platform adds an element of instability that engages your core muscles like never before. Every pose becomes a balance challenge, requiring deeper concentration and body awareness.

**Physical Benefits:**
- **Enhanced Core Strength:** Constant micro-adjustments strengthen deep stabilizing muscles
- **Improved Balance:** Water's movement challenges your proprioception
- **Full-Body Workout:** Every muscle works to maintain stability
- **Low Impact:** Gentle on joints while still challenging

**Mental Benefits:**
- **Increased Focus:** Water demands present-moment awareness
- **Stress Relief:** Nature's sounds provide natural meditation
- **Confidence Building:** Overcoming balance challenges builds mental resilience
- **Mindfulness:** Water connects you to the present moment

**Getting Started:**

**Choose the Right Board:**
- Wider boards (32-36 inches) offer more stability
- Yoga-specific SUPs often have bungee storage and deck pads
- Inflatable boards can be more forgiving for beginners

**Best Conditions:**
- Calm, protected waters like lakes or sheltered bays
- Early morning often offers the calmest conditions
- Avoid windy days until you build confidence

**Essential Poses for Beginners:**
1. **Child's Pose:** Grounding and centering
2. **Downward Dog:** Builds confidence in stability
3. **Warrior III:** Ultimate balance challenge
4. **Savasana:** Deeply relaxing while floating

**Safety Considerations:**
- Always wear a leash
- Start close to shore
- Check weather conditions
- Consider a quick-dry PFD for open water
- Have a backup plan if you fall off

**Pro Tips:**
- Focus on a fixed point on shore for balance
- Breathe deeply - tension makes balancing harder
- Don't fear falling - it's part of the learning process
- Start with familiar poses before trying new ones

**Building Your Practice:**
Begin with basic poses and gradually progress to more challenging sequences. Many practitioners find that SUP yoga actually improves their land-based practice through enhanced body awareness and core strength.

The combination of yoga's mindfulness with water's natural rhythm creates a uniquely transformative experience. Whether you're a yoga veteran or SUP enthusiast looking to deepen your practice, SUP yoga offers a path to greater balance - both on and off the water.`,
    category: "sups",
    author: "Luna Martinez",
    publishedAt: "2024-03-05",
    readTime: 8,
    heroImage: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80",
    tags: ["SUP", "yoga", "balance", "wellness", "mindfulness"]
  },
  {
    id: "skateboard-street-vs-park",
    title: "Street vs Park: Choosing Your Skateboarding Path and Perfect Setup",
    excerpt: "Discover the differences between street and park skateboarding, and learn how to choose the right board setup for your preferred skating style.",
    content: `Skateboarding offers diverse paths for expression and progression. Understanding the differences between street and park skating will help you choose the right direction and dial in your perfect setup.

**Street Skating: Urban Exploration**

Street skating transforms the urban landscape into your skatepark. Stairs, rails, ledges, and gaps become obstacles to conquer with creativity and technical skill.

**Street Skating Characteristics:**
- **Terrain:** Stairs, handrails, ledges, manual pads, gaps
- **Style:** Technical tricks, precision, spot selection
- **Tricks:** Flip tricks, grinds, slides, manual tricks
- **Culture:** DIY spots, video parts, exploration

**Ideal Street Setup:**
- **Deck:** 7.75" - 8.25" width, standard popsicle shape
- **Trucks:** Mid-height trucks for stability and grind clearance
- **Wheels:** Smaller, harder wheels (50-54mm, 99-101a) for speed and trick response
- **Bearings:** Quality bearings for consistent roll

**Park Skating: Flow and Air**

Park skating focuses on transition riding - bowls, vert ramps, and flow-oriented concrete parks where speed and style reign supreme.

**Park Skating Characteristics:**
- **Terrain:** Bowls, vert ramps, mini ramps, flow sections
- **Style:** Speed, flow, air, carving
- **Tricks:** Airs, transfers, carve turns, lip tricks
- **Culture:** Session-based, community-oriented

**Ideal Park Setup:**
- **Deck:** 8.25" - 9"+ width for stability in transition
- **Trucks:** Looser trucks for carving and pumping
- **Wheels:** Larger, softer wheels (56-60mm, 95-99a) for speed and grip
- **Bearings:** High-quality bearings for maintaining speed

**Hybrid Approach: Best of Both Worlds**

Many skaters enjoy both styles, adapting their approach based on the session:

**All-Around Setup:**
- **Deck:** 8.0" - 8.25" width
- **Wheels:** 54-56mm, 99a durometer
- **Trucks:** Medium tightness for versatility

**Key Considerations:**

**Your Local Scene:**
Consider what's available in your area. Urban environments favor street skating, while areas with good skateparks might lean toward transition.

**Personal Style:**
Some skaters are naturally drawn to technical precision (street) while others prefer speed and flow (park).

**Progression Path:**
Both styles offer endless room for growth:
- Street: From basic tricks to complex technical combinations
- Park: From pumping around bowls to launching massive airs

**Cross-Training Benefits:**
Practicing both styles makes you a more complete skater:
- Street skating improves board control and technical skills
- Park skating builds confidence, speed control, and flow

**Equipment Investment:**
Consider starting with a versatile setup and potentially getting a second board optimized for your preferred style as you progress.

**Finding Your Path:**
Try both styles to see what resonates with you. Many of skateboarding's legends excel in both areas, drawing inspiration from the unique challenges each presents.

Remember, there's no wrong choice - skateboarding is about personal expression and having fun. Whether you're threading technical street lines or carving perfect bowl runs, the goal is to keep progressing and enjoying the ride.`,
    category: "skateboards",
    author: "Alex Thompson",
    publishedAt: "2024-03-18",
    readTime: 7,
    heroImage: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&w=1200&q=80",
    thumbnail: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&w=400&q=80",
    tags: ["skateboarding", "street", "park", "setup", "style"]
  }
];
