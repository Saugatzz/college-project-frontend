'use client';
import { useEffect, useState } from 'react';
import {
  Modal, TextInput, Textarea, NumberInput, Select,
  Button, Group, Tabs, ActionIcon, Text, Divider, rem,
} from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import {
  apiCreate, apiUpdate,
  type Package, type TourItinerary, type TourHighlight,
  type TourInclusion, type TourAddon, type TourImage,
} from './TourTable';

interface Props {
  opened: boolean;
  onClose: () => void;
  onSaved: (pkg: Package) => void;
  editData?: Package | null;
}

const EMPTY_FIELDS = {
  name: '', description: '', price: 0, days: 1,
  location: '', difficulty: 'Moderate', category: 'TREKKING',
  badge: '', tagline: '', image: '', reviewCount: 0, rating: 5,
};

type FieldErrors = Partial<Record<keyof typeof EMPTY_FIELDS, string>>;

const FIELD_LABELS: Record<keyof typeof EMPTY_FIELDS, string> = {
  name: 'Tour Name', description: 'Description', price: 'Price',
  days: 'Duration (days)', location: 'Location', difficulty: 'Difficulty',
  category: 'Category', badge: 'Tour tags', tagline: 'Tagline',
  image: 'Image URL', reviewCount: 'Review Count', rating: 'Rating',
};

function validateFields(fields: typeof EMPTY_FIELDS): FieldErrors {
  const errors: FieldErrors = {};
  if (!fields.name.trim())                errors.name        = 'Tour name is required';
  if (!fields.description.trim())         errors.description = 'Description is required';
  if (!fields.location.trim())            errors.location    = 'Location is required';
  if (!fields.difficulty)                 errors.difficulty  = 'Difficulty is required';
  if (!fields.category)                   errors.category    = 'Category is required';
  if (!fields.price || fields.price <= 0) errors.price       = 'Price must be greater than 0';
  if (!fields.days  || fields.days  < 1)  errors.days        = 'Duration must be at least 1 day';
  if (!fields.image.trim())               errors.image       = 'Image URL is required';
  return errors;
}

export default function AddTourModal({ opened, onClose, onSaved, editData }: Props) {
  const [saving,  setSaving]  = useState(false);
  const [fields,  setFields]  = useState({ ...EMPTY_FIELDS });
  const [errors,  setErrors]  = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof typeof EMPTY_FIELDS, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const [itineraries, setItineraries] = useState<TourItinerary[]>([]);
  const [highlights,  setHighlights]  = useState<TourHighlight[]>([]);
  const [inclusions,  setInclusions]  = useState<TourInclusion[]>([]);
  const [addons,      setAddons]      = useState<TourAddon[]>([]);
  const [images,      setImages]      = useState<TourImage[]>([]);

  // ── Populate when editing ────────────────────────────────────────────────
  useEffect(() => {
    if (!opened) return;
    setErrors({});
    setTouched({});
    setSubmitAttempted(false);

    if (editData) {
      setFields({
        name:        editData.name,
        description: editData.description,
        price:       Number(editData.price),
        days:        editData.days,
        location:    editData.location,
        difficulty:  editData.difficulty  ?? 'Moderate',
        category:    editData.category    ?? 'TREKKING',
        badge:       editData.badge       ?? '',
        tagline:     editData.tagline     ?? '',
        image:       editData.image       ?? '',
        reviewCount: editData.reviewCount ?? 0,
        rating:      Number(editData.rating) ?? 5,
      });
      setItineraries(editData.itineraries?.map(({ dayNumber, title, description }) => ({ dayNumber, title, description })) ?? []);
      setHighlights(editData.highlights?.map(({ icon, title, desc }) => ({ icon, title, desc })) ?? []);
      setInclusions(editData.inclusions?.map(({ text, included }) => ({ text, included })) ?? []);
      setAddons(editData.addons?.map(({ name, desc, price }) => ({ name, desc, price: Number(price) })) ?? []);
      setImages(editData.images?.map(({ src, alt }) => ({ src, alt })) ?? []);
    } else {
      setFields({ ...EMPTY_FIELDS });
      setItineraries([]);
      setHighlights([]);
      setInclusions([]);
      setAddons([]);
      setImages([]);
    }
  }, [editData, opened]);

  // ── Field setter with live validation ────────────────────────────────────
  const set = (key: keyof typeof EMPTY_FIELDS) => (val: string | number) => {
    const next = { ...fields, [key]: val };
    setFields(next);
    setTouched(t => ({ ...t, [key]: true }));
    const newErrors = validateFields(next);
    setErrors(e => ({ ...e, [key]: newErrors[key] }));
  };

  const err = (key: keyof typeof EMPTY_FIELDS) =>
    touched[key] ? errors[key] : undefined;

  const itineraryError = itineraries.length === 0 ? 'At least one itinerary day is required' : undefined;
  const imagesError    = images.length      === 0 ? 'At least one image is required'          : undefined;

  // ── Itinerary helpers ────────────────────────────────────────────────────
  const addItin      = () => setItineraries(p => [...p, { dayNumber: p.length + 1, title: '', description: '' }]);
  const updItin      = (i: number, k: keyof TourItinerary, v: string | number) => setItineraries(p => p.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const delItin      = (i: number) => setItineraries(p => p.filter((_, idx) => idx !== i));

  // ── Highlight helpers ────────────────────────────────────────────────────
  const addHighlight = () => setHighlights(p => [...p, { icon: '✨', title: '', desc: '' }]);
  const updHighlight = (i: number, k: keyof TourHighlight, v: string) => setHighlights(p => p.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const delHighlight = (i: number) => setHighlights(p => p.filter((_, idx) => idx !== i));

  // ── Inclusion helpers ────────────────────────────────────────────────────
  const addInclusion     = (included: boolean) => setInclusions(p => [...p, { text: '', included }]);
  const updInclusionText = (i: number, text: string) => setInclusions(p => p.map((x, idx) => idx === i ? { ...x, text } : x));
  const delInclusion     = (i: number) => setInclusions(p => p.filter((_, idx) => idx !== i));

  // ── Addon helpers ────────────────────────────────────────────────────────
  const addAddon = () => setAddons(p => [...p, { name: '', desc: '', price: 0 }]);
  const updAddon = (i: number, k: keyof TourAddon, v: string | number) => setAddons(p => p.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const delAddon = (i: number) => setAddons(p => p.filter((_, idx) => idx !== i));

  // ── Image helpers ────────────────────────────────────────────────────────
  const addImage = () => setImages(p => [...p, { src: '', alt: '' }]);
  const updImage = (i: number, k: keyof TourImage, v: string) => setImages(p => p.map((x, idx) => idx === i ? { ...x, [k]: v } : x));
  const delImage = (i: number) => setImages(p => p.filter((_, idx) => idx !== i));

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const allTouched: Partial<Record<keyof typeof EMPTY_FIELDS, boolean>> = {
      name: true, description: true, location: true,
      difficulty: true, category: true, price: true, days: true,
      image: true,
    };
    setTouched(allTouched);
    setSubmitAttempted(true);

    const newErrors = validateFields(fields);
    setErrors(newErrors);

    const missing: string[] = Object.keys(newErrors).map(
      key => FIELD_LABELS[key as keyof typeof EMPTY_FIELDS]
    );
    if (itineraryError) missing.push('Itinerary (at least 1 day)');
    if (imagesError)    missing.push('Images (at least 1 image)');

    if (missing.length > 0) {
      notifications.show({
        color: 'red',
        title: 'Missing required fields',
        message: (
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {missing.map(label => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        ),
      });
      return;
    }

    setSaving(true);
    try {
      const payload = { ...fields, itineraries, highlights, inclusions, addons, images };
      const result  = editData ? await apiUpdate(editData.id, payload) : await apiCreate(payload);
      onSaved(result);
      notifications.show({
        color: 'green',
        title: editData ? 'Tour updated' : 'Tour created',
        message: editData ? 'Your changes have been saved.' : 'The new tour has been added.',
      });
      onClose();
    } catch (e) {
      notifications.show({
        color: 'red',
        title: 'Something went wrong',
        message: 'Could not save the tour. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Shared styles ────────────────────────────────────────────────────────
  const inputSx = {
    input: { borderColor: '#e2e8f0', fontSize: rem(13), borderRadius: rem(8) },
    label: { fontSize: rem(12), fontWeight: 500, color: '#64748b', marginBottom: rem(4) },
  };

  const DeleteBtn = ({ onClick }: { onClick: () => void }) => (
    <ActionIcon size="sm" color="red" variant="subtle" onClick={onClick}>
      <IconTrash size={13} />
    </ActionIcon>
  );

  const AddBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
    <Button variant="light" size="xs" radius="xl" leftSection={<IconPlus size={13} />} color="blue" onClick={onClick}>
      {label}
    </Button>
  );

  const included = inclusions.map((inc, i) => ({ inc, i })).filter(({ inc }) =>  inc.included);
  const excluded = inclusions.map((inc, i) => ({ inc, i })).filter(({ inc }) => !inc.included);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fz={15} fw={600} c="dark.7">{editData ? 'Edit Tour' : 'Add New Tour'}</Text>}
      size="xl"
      radius="lg"
      styles={{
        header: { borderBottom: '1px solid #f0f4f8', paddingBottom: rem(12) },
        body:   { padding: 0 },
      }}
    >
      <Tabs defaultValue="basics" styles={{ tab: { fontSize: rem(13) } }}>
        <Tabs.List px="md" pt="xs">
          <Tabs.Tab value="basics">
            Basics {Object.keys(errors).length > 0 && touched.name ? (
              <Text span fz={10} c="red" ml={4}>●</Text>
            ) : null}
          </Tabs.Tab>
          <Tabs.Tab value="itinerary">
            Itinerary {itineraries.length > 0 && `(${itineraries.length})`}
            {submitAttempted && itineraryError ? (
              <Text span fz={10} c="red" ml={4}>●</Text>
            ) : null}
          </Tabs.Tab>
          <Tabs.Tab value="highlights">Highlights {highlights.length > 0 && `(${highlights.length})`}</Tabs.Tab>
          <Tabs.Tab value="inclusions">Inclusions {inclusions.length > 0 && `(${inclusions.length})`}</Tabs.Tab>
          <Tabs.Tab value="addons">Add-ons {addons.length > 0 && `(${addons.length})`}</Tabs.Tab>
          <Tabs.Tab value="images">
            Images {images.length > 0 && `(${images.length})`}
            {submitAttempted && imagesError ? (
              <Text span fz={10} c="red" ml={4}>●</Text>
            ) : null}
          </Tabs.Tab>
        </Tabs.List>

        {/* ── Basics ────────────────────────────────────────────────────── */}
        <Tabs.Panel value="basics" p="md">
          <div className="flex flex-col gap-3">
            <TextInput
              label="Tour Name *" value={fields.name} styles={inputSx}
              error={err('name')}
              onChange={e => set('name')(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, name: true }))}
            />
            <TextInput
              label="Tagline" value={fields.tagline} styles={inputSx}
              onChange={e => set('tagline')(e.target.value)}
            />
            <Textarea
              label="Description *" value={fields.description} minRows={3} styles={inputSx}
              error={err('description')}
              onChange={e => set('description')(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, description: true }))}
            />

            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="Price (USD) *" value={fields.price}
                onChange={v => set('price')(Number(v))} min={0} styles={inputSx}
                error={err('price')}
                onBlur={() => setTouched(t => ({ ...t, price: true }))}
              />
              <NumberInput
                label="Duration (days) *" value={fields.days}
                onChange={v => set('days')(Number(v))} min={1} styles={inputSx}
                error={err('days')}
                onBlur={() => setTouched(t => ({ ...t, days: true }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <TextInput
                label="Location *" value={fields.location} styles={inputSx}
                error={err('location')}
                onChange={e => set('location')(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, location: true }))}
              />
              <TextInput
                label="Tour tags (eg : Family friendly)" value={fields.badge} styles={inputSx}
                onChange={e => set('badge')(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Select
                label="Difficulty *" value={fields.difficulty} styles={inputSx}
                onChange={v => set('difficulty')(v ?? 'Moderate')}
                onBlur={() => setTouched(t => ({ ...t, difficulty: true }))}
                error={err('difficulty')}
                data={['Easy', 'Moderate', 'Challenging', 'Hard']}
              />
              <Select
                label="Category *" value={fields.category} styles={inputSx}
                onChange={v => set('category')(v ?? 'TREKKING')}
                onBlur={() => setTouched(t => ({ ...t, category: true }))}
                error={err('category')}
                data={['TREKKING', 'CULTURAL', 'ADVENTURE', 'WILDLIFE', 'MOST POPULAR']}
              />
            </div>

            <TextInput
              label="Image URL *" value={fields.image} styles={inputSx}
              error={err('image')}
              onChange={e => set('image')(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, image: true }))}
            />

            <div className="grid grid-cols-2 gap-3">
              <NumberInput
                label="Rating (0–5)" value={fields.rating} min={0} max={5}
                step={0.1} styles={inputSx}
                onChange={v => set('rating')(Number(v))}
              />
              <NumberInput
                label="Review Count" value={fields.reviewCount} min={0} styles={inputSx}
                onChange={v => set('reviewCount')(Number(v))}
              />
            </div>
          </div>
        </Tabs.Panel>

        {/* ── Itinerary ──────────────────────────────────────────────────── */}
        <Tabs.Panel value="itinerary" p="md">
          <div className="flex flex-col gap-3">
            {itineraries.map((itin, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <Text fz={11} fw={600} c="gray.5" tt="uppercase" style={{ letterSpacing: '0.08em' }}>
                    Day {itin.dayNumber}
                  </Text>
                  <DeleteBtn onClick={() => delItin(i)} />
                </div>
                <div className="grid grid-cols-[80px_1fr] gap-2 mb-2">
                  <NumberInput label="Day #" value={itin.dayNumber} min={1} styles={inputSx} onChange={v => updItin(i, 'dayNumber', Number(v))} />
                  <TextInput   label="Title" value={itin.title}     styles={inputSx} onChange={e => updItin(i, 'title', e.target.value)} />
                </div>
                <Textarea label="Description" value={itin.description} minRows={2} styles={inputSx} onChange={e => updItin(i, 'description', e.target.value)} />
              </div>
            ))}
            <AddBtn onClick={addItin} label="Add Day" />
            {submitAttempted && itineraryError ? (
              <Text fz={12} c="red">{itineraryError}</Text>
            ) : null}
          </div>
        </Tabs.Panel>

        {/* ── Highlights ─────────────────────────────────────────────────── */}
        <Tabs.Panel value="highlights" p="md">
          <div className="flex flex-col gap-3">
            {highlights.map((h, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <Text fz={11} fw={600} c="gray.5" tt="uppercase" style={{ letterSpacing: '0.08em' }}>
                    Highlight {i + 1}
                  </Text>
                  <DeleteBtn onClick={() => delHighlight(i)} />
                </div>
                <div className="grid grid-cols-[64px_1fr] gap-2 mb-2">
                  <TextInput label="Icon"  value={h.icon}  placeholder="🏔️" styles={inputSx} onChange={e => updHighlight(i, 'icon',  e.target.value)} />
                  <TextInput label="Title" value={h.title}                   styles={inputSx} onChange={e => updHighlight(i, 'title', e.target.value)} />
                </div>
                <Textarea label="Description" value={h.desc} minRows={2} styles={inputSx} onChange={e => updHighlight(i, 'desc', e.target.value)} />
              </div>
            ))}
            <AddBtn onClick={addHighlight} label="Add Highlight" />
          </div>
        </Tabs.Panel>

        {/* ── Inclusions ─────────────────────────────────────────────────── */}
        <Tabs.Panel value="inclusions" p="md">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <Text fz={12} fw={600} c="teal.7" tt="uppercase" style={{ letterSpacing: '0.1em', marginBottom: rem(10) }}>✓ Included</Text>
              <div className="flex flex-col gap-2">
                {included.map(({ inc, i }) => (
                  <div key={i} className="flex items-center gap-2">
                    <TextInput value={inc.text} placeholder="e.g. Airport transfers" styles={inputSx} style={{ flex: 1 }} onChange={e => updInclusionText(i, e.target.value)} />
                    <DeleteBtn onClick={() => delInclusion(i)} />
                  </div>
                ))}
                <Button variant="light" size="xs" radius="xl" color="teal" leftSection={<IconPlus size={13} />} onClick={() => addInclusion(true)}>Add Item</Button>
              </div>
            </div>
            <div>
              <Text fz={12} fw={600} c="red.6" tt="uppercase" style={{ letterSpacing: '0.1em', marginBottom: rem(10) }}>✗ Not Included</Text>
              <div className="flex flex-col gap-2">
                {excluded.map(({ inc, i }) => (
                  <div key={i} className="flex items-center gap-2">
                    <TextInput value={inc.text} placeholder="e.g. International flights" styles={inputSx} style={{ flex: 1 }} onChange={e => updInclusionText(i, e.target.value)} />
                    <DeleteBtn onClick={() => delInclusion(i)} />
                  </div>
                ))}
                <Button variant="light" size="xs" radius="xl" color="red" leftSection={<IconPlus size={13} />} onClick={() => addInclusion(false)}>Add Item</Button>
              </div>
            </div>
          </div>
        </Tabs.Panel>

        {/* ── Add-ons ────────────────────────────────────────────────────── */}
        <Tabs.Panel value="addons" p="md">
          <div className="flex flex-col gap-3">
            {addons.map((a, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <Text fz={11} fw={600} c="gray.5" tt="uppercase" style={{ letterSpacing: '0.08em' }}>
                    Add-on {i + 1}
                  </Text>
                  <DeleteBtn onClick={() => delAddon(i)} />
                </div>
                <div className="grid grid-cols-[1fr_100px] gap-2 mb-2">
                  <TextInput   label="Name"     value={a.name}  styles={inputSx} onChange={e => updAddon(i, 'name',  e.target.value)} />
                  <NumberInput label="Price ($)" value={a.price} min={0} styles={inputSx} onChange={v => updAddon(i, 'price', Number(v))} />
                </div>
                <Textarea label="Description" value={a.desc} minRows={2} styles={inputSx} onChange={e => updAddon(i, 'desc', e.target.value)} />
              </div>
            ))}
            <AddBtn onClick={addAddon} label="Add Add-on" />
          </div>
        </Tabs.Panel>

        {/* ── Images ─────────────────────────────────────────────────────── */}
        <Tabs.Panel value="images" p="md">
          <Text fz={12} c="dimmed" mb={12}>First image is used as the card thumbnail. Subsequent images appear in the gallery.</Text>
          <div className="flex flex-col gap-3">
            {images.map((img, i) => (
              <div key={i} className="flex items-end gap-2">
                <TextInput label={i === 0 ? 'Thumbnail URL' : `Image ${i + 1} URL`} value={img.src} styles={inputSx} style={{ flex: 2 }} onChange={e => updImage(i, 'src', e.target.value)} />
                <TextInput label="Alt text" value={img.alt} styles={inputSx} style={{ flex: 1 }} onChange={e => updImage(i, 'alt', e.target.value)} />
                <ActionIcon size="md" color="red" variant="subtle" mb={2} onClick={() => delImage(i)}><IconTrash size={13} /></ActionIcon>
              </div>
            ))}
            <AddBtn onClick={addImage} label="Add Image" />
            {submitAttempted && imagesError ? (
              <Text fz={12} c="red">{imagesError}</Text>
            ) : null}
          </div>
        </Tabs.Panel>
      </Tabs>

      <Divider />
      <Group justify="flex-end" p="md">
        <Button variant="subtle" color="gray" size="sm" radius="xl" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="sm" radius="xl" loading={saving} onClick={handleSubmit}
          styles={{ root: { background: 'linear-gradient(135deg, #2E86C1, #1A5276)', border: 'none' } }}
        >
          {editData ? 'Save Changes' : 'Create Tour'}
        </Button>
      </Group>
    </Modal>
  );
}