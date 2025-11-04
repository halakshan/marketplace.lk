import { Router, Request, Response } from 'express';
import { db } from '../config/firebase';
import { verifyToken } from '../middleware/auth';

const router = Router();

// Serialize Firestore Timestamps to ISO strings so the frontend can parse dates
function serializeAd(ad: any): any {
  const out = { ...ad };
  for (const key of ['createdAt', 'updatedAt']) {
    if (out[key]?.toDate) out[key] = out[key].toDate().toISOString();
    else if (out[key]?._seconds) out[key] = new Date(out[key]._seconds * 1000).toISOString();
  }
  return out;
}

// ─── GET /api/ads ─── browse / search / filter
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, subcategory, search, minPrice, maxPrice, condition, city, district, page = '1', limit = '20', sort = 'newest' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    let snap = await db.collection('ads').where('status', '==', 'active').get();
    let ads = snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];

    if (category)    ads = ads.filter(a => a.category === category);
    if (subcategory) ads = ads.filter(a => a.subcategory === subcategory);
    if (condition)   ads = ads.filter(a => a.condition === condition);
    if (city)        ads = ads.filter(a => a.city?.toLowerCase() === (city as string).toLowerCase());
    if (district)    ads = ads.filter(a => a.district?.toLowerCase() === (district as string).toLowerCase());

    if (minPrice) ads = ads.filter(a => a.price !== null && a.price >= parseFloat(minPrice as string));
    if (maxPrice) ads = ads.filter(a => a.price !== null && a.price <= parseFloat(maxPrice as string));

    if (search) {
      const q = (search as string).toLowerCase();
      ads = ads.filter(a =>
        a.title?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q) ||
        a.make?.toLowerCase().includes(q) ||
        a.model?.toLowerCase().includes(q) ||
        a.brand?.toLowerCase().includes(q)
      );
    }

    // Sort
    ads.sort((a, b) => {
      // Featured always first
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      if (sort === 'price_asc')  return (a.price ?? 0) - (b.price ?? 0);
      if (sort === 'price_desc') return (b.price ?? 0) - (a.price ?? 0);
      const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const db2 = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return db2.getTime() - da.getTime();
    });

    const total = ads.length;
    const data  = ads.slice((pageNum - 1) * limitNum, pageNum * limitNum).map(serializeAd);
    res.json({ success: true, data, total, page: pageNum, pages: Math.ceil(total / limitNum) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch ads' });
  }
});

// ─── GET /api/ads/featured ───
router.get('/featured', async (_req: Request, res: Response): Promise<void> => {
  try {
    const snap = await db.collection('ads').where('status', '==', 'active').where('isFeatured', '==', true).get();
    const ads = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => {
        const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const db2 = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return db2.getTime() - da.getTime();
      }).slice(0, 8).map(serializeAd);
    res.json({ success: true, data: ads });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch featured ads' });
  }
});

// ─── GET /api/ads/my ─── logged-in user's own ads
router.get('/my', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const snap = await db.collection('ads').where('userId', '==', req.user!.uid).get();
    const ads = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      .sort((a: any, b: any) => {
        const da = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
        const db2 = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
        return db2.getTime() - da.getTime();
      }).map(serializeAd);
    res.json({ success: true, data: ads });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch your ads' });
  }
});

// ─── GET /api/ads/:id ───
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const doc = await db.collection('ads').doc(req.params.id).get();
    if (!doc.exists) { res.status(404).json({ success: false, message: 'Ad not found' }); return; }
    await doc.ref.update({ views: (doc.data()?.views || 0) + 1 });
    res.json({ success: true, data: serializeAd({ id: doc.id, ...doc.data() }) });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to fetch ad' });
  }
});

// ─── POST /api/ads ─── any logged-in user
router.post('/', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title, description, price, priceNegotiable, category, categoryName, subcategory,
      condition, images, city, district, posterPhone, posterWhatsapp,
      make, model, year, mileage, fuelType, transmission,
      bedrooms, bathrooms, floorArea, landArea, furnishing, propertyType,
      brand,
    } = req.body;

    const userDoc = await db.collection('users').doc(req.user!.uid).get();
    const userData = userDoc.data();

    const docRef = await db.collection('ads').add({
      userId: req.user!.uid,
      posterName: userData?.displayName || '',
      posterPhone: posterPhone || userData?.phone || '',
      posterWhatsapp: posterWhatsapp || '',
      title,
      description,
      price: price !== undefined && price !== '' ? parseFloat(price) : null,
      priceNegotiable: !!priceNegotiable,
      category,
      categoryName,
      subcategory: subcategory || '',
      condition: condition || 'used',
      images: images || [],
      city: city || '',
      district: district || '',
      // Vehicle
      make: make || null,
      model: model || null,
      year: year ? parseInt(year) : null,
      mileage: mileage ? parseInt(mileage) : null,
      fuelType: fuelType || null,
      transmission: transmission || null,
      // Property
      bedrooms: bedrooms ? parseInt(bedrooms) : null,
      bathrooms: bathrooms ? parseInt(bathrooms) : null,
      floorArea: floorArea ? parseFloat(floorArea) : null,
      landArea: landArea ? parseFloat(landArea) : null,
      furnishing: furnishing || null,
      propertyType: propertyType || null,
      // General
      brand: brand || null,
      views: 0,
      status: 'active',
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({ success: true, data: { id: docRef.id } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to post ad' });
  }
});

// ─── PUT /api/ads/:id ─── owner only
router.put('/:id', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const doc = await db.collection('ads').doc(req.params.id).get();
    if (!doc.exists) { res.status(404).json({ success: false, message: 'Ad not found' }); return; }
    if (doc.data()?.userId !== req.user!.uid && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized' }); return;
    }
    const { title, description, price, priceNegotiable, subcategory, condition, images,
            city, district, posterPhone, posterWhatsapp,
            make, model, year, mileage, fuelType, transmission,
            bedrooms, bathrooms, floorArea, landArea, furnishing, propertyType, brand } = req.body;

    await doc.ref.update({
      title, description,
      price: price !== undefined && price !== '' ? parseFloat(price) : null,
      priceNegotiable: !!priceNegotiable,
      subcategory: subcategory || '',
      condition,
      images: images || [],
      city, district,
      posterPhone, posterWhatsapp: posterWhatsapp || '',
      make: make || null, model: model || null,
      year: year ? parseInt(year) : null,
      mileage: mileage ? parseInt(mileage) : null,
      fuelType: fuelType || null, transmission: transmission || null,
      bedrooms: bedrooms ? parseInt(bedrooms) : null,
      bathrooms: bathrooms ? parseInt(bathrooms) : null,
      floorArea: floorArea ? parseFloat(floorArea) : null,
      landArea: landArea ? parseFloat(landArea) : null,
      furnishing: furnishing || null, propertyType: propertyType || null,
      brand: brand || null,
      updatedAt: new Date(),
    });
    res.json({ success: true, message: 'Ad updated' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update ad' });
  }
});

// ─── PATCH /api/ads/:id/status ─── mark sold / reactivate
router.patch('/:id/status', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const doc = await db.collection('ads').doc(req.params.id).get();
    if (!doc.exists) { res.status(404).json({ success: false, message: 'Ad not found' }); return; }
    if (doc.data()?.userId !== req.user!.uid && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized' }); return;
    }
    await doc.ref.update({ status: req.body.status, updatedAt: new Date() });
    res.json({ success: true, message: 'Ad status updated' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
});

// ─── DELETE /api/ads/:id ───
router.delete('/:id', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const doc = await db.collection('ads').doc(req.params.id).get();
    if (!doc.exists) { res.status(404).json({ success: false, message: 'Ad not found' }); return; }
    if (doc.data()?.userId !== req.user!.uid && req.user!.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized' }); return;
    }
    await doc.ref.update({ status: 'deleted', updatedAt: new Date() });
    res.json({ success: true, message: 'Ad deleted' });
  } catch {
    res.status(500).json({ success: false, message: 'Failed to delete ad' });
  }
});

export default router;
