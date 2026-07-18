import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PhoneNumberInput } from "@/components/common/PhoneNumber";

export function CustomerForm({ form={}, onChange, setForm, errors={} }) {
  return (
    <div className="grid grid-cols-12 gap-3">
      <div className="col-span-12 md:col-span-6">
        <Label>Full Name</Label>
        <Input name="fullName" value={form.fullName} onChange={onChange} />
        {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
      </div>
      <div className="col-span-12 md:col-span-6">
        <Label htmlFor="phone">Phone</Label>
        <PhoneNumberInput value={form.phone} onChange={(value) => setForm((prev) => ({ ...prev, phone: value || "" }))} />
        {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
      </div>
      <div className="col-span-12 md:col-span-6">
        <Label>Email</Label>
        <Input name="email" type="email" value={form.email} onChange={onChange} />
        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
      </div>
      <div className="col-span-12 md:col-span-3">
        <Label>Gender</Label>
        <Select
          value={form.gender}
          onValueChange={(value) =>
            setForm((prev) => ({
              ...prev,
              gender: value,
            }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="MALE">Male</SelectItem>
            <SelectItem value="FEMALE">Female</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
            <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
          </SelectContent>
        </Select>
        {errors.gender && <p className="text-xs text-red-500">{errors.gender}</p>}
      </div>
      <div className="col-span-12 md:col-span-3">
        <Label>Status</Label>
        <Select value={form.status} onValueChange={(value) => setForm((prev) => ({ ...prev, status: value }))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="INACTIVE">Inactive</SelectItem>
            <SelectItem value="BLOCKED">Blocked</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && <p className="text-xs text-red-500">{errors.status}</p>}
      </div>
      <div className="col-span-12 md:col-span-3">
        <Label>Date of Birth</Label>
        <Input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={onChange} />
      </div>

      <div className="col-span-12 md:col-span-3">
        <Label>Profile Photo URL</Label>
        <Input name="profilePhoto" value={form.profilePhoto} onChange={onChange} />
      </div>
      <div className="col-span-12">
        <Label>Address</Label>
        <Input name="address" value={form.address} onChange={onChange} />
      </div>
      <div className="col-span-12 md:col-span-6">
        <Label>Tags</Label>
        <Input name="tags" value={form.tags} onChange={onChange} placeholder="VIP, Regular, Walk-in" />
      </div>
      <div className="col-span-12 md:col-span-3">
        <Label>Preferred Staff</Label>
        <Input name="preferredStaffName" value={form.preferredStaffName} onChange={onChange} />
      </div>
      <div className="col-span-12 md:col-span-3">
        <Label>Preferred Service</Label>
        <Input name="preferredServiceName" value={form.preferredServiceName} onChange={onChange} />
      </div>
      <div className="col-span-6 md:col-span-3">
        <Label>Loyalty Points</Label>
        <Input name="loyaltyPoints" type="number" value={form.loyaltyPoints} onChange={onChange} />
      </div>
      <div className="col-span-6 md:col-span-3">
        <Label>Earned Points</Label>
        <Input name="earnedPoints" type="number" value={form.earnedPoints} onChange={onChange} />
      </div>
      <div className="col-span-6 md:col-span-3">
        <Label>Redeemed Points</Label>
        <Input name="redeemedPoints" type="number" value={form.redeemedPoints} onChange={onChange} />
      </div>
      <div className="col-span-6 md:col-span-3">
        <Label>Membership Level</Label>
        <Input name="membershipLevel" value={form.membershipLevel} onChange={onChange} />
      </div>
      <div className="col-span-12">
        <Label>Notes</Label>
        <Textarea name="notes" value={form.notes} onChange={onChange} className="min-h-24" />
      </div>
    </div>
  );
}
