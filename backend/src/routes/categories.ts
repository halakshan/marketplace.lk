import { Router, Request, Response } from 'express';
import { db } from '../config/firebase';
import { verifyToken, requireRole } from '../middleware/auth';

const router = Router();

// Default ikman-style categories seeded on first request
const DEFAULT_CATEGORIES = [
  {
    slug: 'vehicles', name: 'Vehicles', icon: '🚗',
    subcategories: ['Cars', 'Vans & Jeeps', 'Motorcycles & Scooters', 'Buses & Coaches', 'Lorries & Trucks', 'Three-wheelers', 'Boats & Water Transport', 'Other Vehicles'],
  },
  {
    slug: 'property', name: 'Property', icon: '🏠',
    subcategories: ['Houses', 'Apartments & Flats', 'Rooms', 'Commercial Property', 'Industrial Property', 'Other Property'],
  },
  {
    slug: 'land', name: 'Land', icon: '🌳',
    subcategories: ['Agricultural Land', 'Residential Land', 'Commercial Land', 'Industrial Land', 'Other Land'],
  },
  {
    slug: 'electronics', name: 'Electronics', icon: '📱',
    subcategories: ['Mobile Phones', 'Computers & Laptops', 'TVs & Monitors', 'Cameras & Accessories', 'Audio & Music', 'Computer Accessories', 'Other Electronics'],
  },
  {
    slug: 'home-garden', name: 'Home & Garden', icon: '🛋️',
    subcategories: ['Furniture', 'Kitchen Appliances', 'Home Appliances', 'Garden & Outdoor', 'Home Décor', 'Other Home Items'],
  },
  {
    slug: 'jobs', name: 'Jobs', icon: '💼',
    subcategories: ['Accounting & Finance', 'IT & Technology', 'Construction', 'Healthcare', 'Education', 'Sales & Marketing', 'Other Jobs'],
  },
  {
    slug: 'services', name: 'Services', icon: '🔧',
    subcategories: ['Construction & Renovation', 'Cleaning', 'IT & Computer', 'Photography', 'Transport', 'Education & Tutoring', 'Other Services'],
  },
  {
    slug: 'animals', name: 'Animals & Pets', icon: '🐾',
    subcategories: ['Dogs', 'Cats', 'Birds', 'Fish & Aquariums', 'Pet Accessories', 'Other Animals'],
  },
  {
    slug: 'fashion', name: 'Fashion & Beauty', icon: '👗',
    subcategories: ["Men's Clothing", "Women's Clothing", 'Kids Clothing', 'Shoes', 'Bags & Accessories', 'Jewellery', 'Other Fashion'],
  },
  {
    slug: 'sports', name: 'Sports & Outdoors', icon: '⚽',
    subcategories: ['Cricket', 'Football', 'Fitness Equipment', 'Cycling', 'Water Sports', 'Other Sports'],
  },
  {
    slug: 'other', name: 'Other', icon: '📦',
    subcategories: ['Books & Magazines', 'Music & Movies', 'Baby & Kids', 'Toys & Games', 'Art & Collectibles', 'Other'],
  },
];

// Seed categories if collection is empty
async function seedIfEmpty() {
  const snap = await db.collection('categories').limit(1).get();
  if (!snap.empty) return;
  const batch = db.batch();
  for (const cat of DEFAULT_CATEGORIES) {
    const ref = db.collection('categories').doc(cat.slug);
    batch.set(ref, { ...cat, isActive: true, adCount: 0, createdAt: new Date() });
  }
  await batch.commit();
}

// GET /api/categories - public
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    await seedIfEmpty();
    const snap = await db.collection('categories').where('isActive', '==', true).get();
    const cats = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => {
        const order = DEFAULT_CATEGORIES.map(c => c.slug);
        return order.indexOf(a.slug || a.id) - order.indexOf(b.slug || b.id);
      });
    res.json({ success: true, data: cats });
  } catch (err) {
    console.error('Categories error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// POST /api/categories - admin
router.post('/', verifyToken, requireRole('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, icon, subcategories } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const exists = await db.collection('categories').where('slug', '==', slug).get();
    if (!exists.empty) { res.status(400).json({ success: false, message: 'Category already exists' }); return; }
    const docRef = await db.collection('categories').add({
      name, slug, icon: icon || '📦', subcategories: subcategories || [],
      isActive: true, adCount: 0, createdAt: new Date(),
    });
    res.status(201).json({ success: true, data: { id: docRef.id } });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
});

// PUT /api/categories/:id - admin
router.put('/:id', verifyToken, requireRole('admin'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, icon, subcategories, isActive } = req.body;
    await db.collection('categories').doc(req.params.id).update({ name, icon, subcategories, isActive, updatedAt: new Date() });
    res.json({ success: true, message: 'Category updated' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update category' });
  }
});

export default router;
