import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import { Clock, Calendar as CalendarIcon, CheckCircle2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { createBooking, getTutorBookingsForDate, getParentChildren, getProfileByUserId, createRecurringBookings } from "@/lib/api";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

interface BookingCalendarProps {
    tutorId: string;
    hourlyRate: number;
}

// 24-hour booking slots (6AM to 10PM)
const TIME_SLOTS = [
    "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
    "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
    "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM", "10:00 PM",
];

const BookingCalendar = ({ tutorId, hourlyRate }: BookingCalendarProps) => {
    const { user } = useAuth();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [isBooking, setIsBooking] = useState(false);
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvc, setCvc] = useState("");
    const [duration, setDuration] = useState(1);
    const [isRecurring, setIsRecurring] = useState(false);
    const [recurrenceWeeks, setRecurrenceWeeks] = useState(4);

    // Group lesson
    const [isGroupLesson, setIsGroupLesson] = useState(false);
    const [groupSize, setGroupSize] = useState(2);

    // Payment features
    const [isGift, setIsGift] = useState(false);
    const [giftEmail, setGiftEmail] = useState("");
    const [couponCode, setCouponCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [tipAmount, setTipAmount] = useState(0);
    const [useBalance, setUseBalance] = useState(false);
    const [smsCode, setSmsCode] = useState("");
    const [showVerification, setShowVerification] = useState(false);
    const mockBalance = 50.00;

    // Parent features
    const { role } = useAuth();
    const [children, setChildren] = useState<any[]>([]);
    const [selectedChildren, setSelectedChildren] = useState<string[]>([]);
    const [isLoadingChildren, setIsLoadingChildren] = useState(false);

    useEffect(() => {
        if (role === "parent" && user) {
            const fetchChildren = async () => {
                setIsLoadingChildren(true);
                const { data: links } = await getParentChildren(user.id);
                if (links) {
                    const childrenWithProfiles = await Promise.all(
                        links.filter(l => l.status === 'linked').map(async (link: any) => {
                            if (link.child_id) {
                                const { data: prof } = await getProfileByUserId(link.child_id);
                                return { ...link, profile: prof };
                            }
                            return link;
                        })
                    );
                    setChildren(childrenWithProfiles.filter(c => c.profile));
                }
                setIsLoadingChildren(false);
            };
            fetchChildren();
        }
    }, [role, user]);

    // Update group lesson state based on selected children
    useEffect(() => {
        if (selectedChildren.length > 1) {
            setIsGroupLesson(true);
            setGroupSize(selectedChildren.length);
        } else if (selectedChildren.length === 1) {
            setIsGroupLesson(false);
            setGroupSize(1);
        }
    }, [selectedChildren]);

    useEffect(() => {
        if (!date) return;
        const fetchBookedSlots = async () => {
            const dateStr = format(date, "yyyy-MM-dd");
            const { data } = await getTutorBookingsForDate(tutorId, dateStr);
            setBookedSlots(data.map((b) => b.time_slot));
        };
        fetchBookedSlots();
    }, [date, tutorId]);

    const isSlotUnavailable = (time: string) => bookedSlots.includes(time);

    const handleBook = async () => {
        if (!date || !selectedSlot) return;
        if (!user) {
            toast.error("Please log in to book a lesson", {
                description: "You need an account to book tutoring sessions.",
                action: { label: "Log in", onClick: () => window.location.href = "/login" },
            });
            return;
        }
        if (user.id === tutorId) {
            toast.error("You can't book a lesson with yourself!");
            return;
        }
        if (hourlyRate > 0) {
            setIsPaymentOpen(true);
        } else {
            processBooking();
        }
    };

    const processBooking = async () => {
        setIsBooking(true);
        
        // Determine who the booking is for
        const targetStudentIds = role === "parent" && selectedChildren.length > 0 
            ? selectedChildren 
            : [user!.id];

        const seriesId = isRecurring ? crypto.randomUUID() : undefined;
        const weeksToCreate = isRecurring ? recurrenceWeeks : 1;
        
        const bookingPromises: any[] = [];

        for (let i = 0; i < weeksToCreate; i++) {
            const currentBookingDate = new Date(date!);
            currentBookingDate.setDate(currentBookingDate.getDate() + (i * 7));
            const currentBookingDateStr = format(currentBookingDate, "yyyy-MM-dd");

            targetStudentIds.forEach(studentId => {
                bookingPromises.push(createBooking({
                    tutor_id: tutorId,
                    student_id: studentId,
                    booking_date: currentBookingDateStr,
                    time_slot: selectedSlot as string,
                    hourly_rate: isGroupLesson ? perStudentRate : hourlyRate,
                    is_recurring: isRecurring,
                    recurring_series_id: seriesId
                }));
            });
        }

        const results = await Promise.all(bookingPromises);
        const error = results.find(r => r.error)?.error;
        
        setIsBooking(false);
        setIsPaymentOpen(false);
        setCardNumber(""); setExpiry(""); setCvc("");

        if (error) {
            toast.error("Failed to book lesson", { description: error.message });
            return;
        }
        
        toast.success(isRecurring ? `${weeksToCreate} weekly lessons booked successfully!` : (isGroupLesson ? "Group booking confirmed!" : "Booking confirmed!"), {
            description: `Your session is scheduled starting ${format(date as Date, "MMMM do")} at ${selectedSlot}.`,
        });

        // Auto-add to Google Calendar
        try {
            const startDate = format(date as Date, "yyyyMMdd");
            const title = encodeURIComponent(`Tutoring Session${isRecurring ? ' (Recurring)' : ''}`);
            const details = encodeURIComponent(`Lesson at ${selectedSlot}. Rate: $${hourlyRate}/hr`);
            const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${startDate}&details=${details}${isRecurring ? '&recur=RRULE:FREQ=WEEKLY;COUNT=' + weeksToCreate : ''}`;
            window.open(calUrl, '_blank');
        } catch {}

        setBookedSlots((prev) => [...prev, selectedSlot as string]);
        setSelectedSlot(null);
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (showVerification) {
            if (smsCode === "1234") {
                toast.success("Payment verified and successful");
                processBooking();
            } else {
                toast.error("Invalid verification code", { description: "Please enter 1234 to verify." });
            }
            return;
        }
        if (!useBalance && (cardNumber.length < 16 || expiry.length < 5 || cvc.length < 3)) {
            toast.error("Invalid payment details");
            return;
        }
        setShowVerification(true);
        toast.info("Verification Required", { description: "Please enter the SMS code sent to your phone (hint: 1234)." });
    };

    const applyCoupon = () => {
        if (couponCode.toLowerCase() === "save20") {
            setDiscount(basePricePerSession * 0.2);
            toast.success("Coupon applied! 20% off.");
        } else if (couponCode.toLowerCase() === "group10") {
            setDiscount(basePricePerSession * 0.1);
            toast.success("Group coupon applied! 10% off.");
        } else {
            setDiscount(0);
            toast.error("Invalid coupon code");
        }
    };

    // Group lesson pricing: per-student rate decreases as group grows
    const perStudentRate = isGroupLesson ? hourlyRate * (1 - (groupSize - 1) * 0.1) : hourlyRate;
    const basePricePerSession = isGroupLesson ? perStudentRate * duration * groupSize : hourlyRate * duration;
    
    const calculateTotal = () => {
        let multiplier = 1;
        if (isRecurring) {
            multiplier = recurrenceWeeks * 0.9; // 10% discount for recurring
        }
        return (basePricePerSession * multiplier) - discount + tipAmount - (useBalance ? mockBalance : 0);
    };

    const finalAmount = Math.max(0, calculateTotal());

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardContent className="p-4 flex justify-center">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => { setDate(d); setSelectedSlot(null); }}
                        className="rounded-md border shadow-sm"
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                </CardContent>
            </Card>

            <div className="space-y-6">
                <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        {date ? format(date, "EEEE, MMMM do, yyyy") : "Select a date"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Select a time slot for your {hourlyRate > 0 ? `$${hourlyRate}/hr` : "free"} lesson.
                    </p>


                    <div className="max-h-[280px] overflow-y-auto pr-1 space-y-4">
                        {date ? (
                            <>
                                {/* Morning slots */}
                                <div>
                                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 inline-block" />
                                        Morning
                                    </p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {TIME_SLOTS.filter(t => t.includes("AM")).map((time) => {
                                            const disabled = isSlotUnavailable(time);
                                            const selected = selectedSlot === time;
                                            return (
                                                <button key={time} disabled={disabled}
                                                    onClick={() => !disabled && setSelectedSlot(time)}
                                                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all text-center ${
                                                        selected ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
                                                        : disabled ? "opacity-40 cursor-not-allowed bg-muted/50 text-muted-foreground border-dashed line-through"
                                                        : "bg-card hover:border-primary hover:bg-primary/5 hover:shadow-sm"
                                                    }`}>
                                                    {time}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                {/* Afternoon slots */}
                                <div>
                                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-1.5">
                                        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 inline-block" />
                                        Afternoon
                                    </p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {TIME_SLOTS.filter(t => t.includes("PM") && parseInt(t) <= 5 && parseInt(t) !== 12 || t === "12:00 PM").map((time) => {
                                            const disabled = isSlotUnavailable(time);
                                            const selected = selectedSlot === time;
                                            return (
                                                <button key={time} disabled={disabled}
                                                    onClick={() => !disabled && setSelectedSlot(time)}
                                                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all text-center ${
                                                        selected ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
                                                        : disabled ? "opacity-40 cursor-not-allowed bg-muted/50 text-muted-foreground border-dashed line-through"
                                                        : "bg-card hover:border-primary hover:bg-primary/5 hover:shadow-sm"
                                                    }`}>
                                                    {time}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                                {/* Evening slots */}
                                <div>
                                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-1.5">
                                        <span className="h-1.5 w-1.5 rounded-full bg-purple-500 inline-block" />
                                        Evening
                                    </p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {TIME_SLOTS.filter(t => t.includes("PM") && parseInt(t) >= 6 && parseInt(t) !== 12).map((time) => {
                                            const disabled = isSlotUnavailable(time);
                                            const selected = selectedSlot === time;
                                            return (
                                                <button key={time} disabled={disabled}
                                                    onClick={() => !disabled && setSelectedSlot(time)}
                                                    className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all text-center ${
                                                        selected ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
                                                        : disabled ? "opacity-40 cursor-not-allowed bg-muted/50 text-muted-foreground border-dashed line-through"
                                                        : "bg-card hover:border-primary hover:bg-primary/5 hover:shadow-sm"
                                                    }`}>
                                                    {time}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="py-8 text-center text-muted-foreground border rounded-md border-dashed w-full">
                                Please select a date from the calendar to view available times.
                            </div>
                        )}
                    </div>
                </div>

                {selectedSlot && date && (
                    <div className="rounded-lg border bg-accent/20 p-4 space-y-4 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                            <div className="w-full">
                                <h4 className="font-medium">Ready to book?</h4>
                                <p className="text-sm text-muted-foreground">
                                    {format(date, "MMM do")} at {selectedSlot}
                                </p>
                                <div className="mt-4 flex flex-col gap-3">
                                    {/* Parent: Select Children */}
                                    {role === "parent" && children.length > 0 && (
                                        <div className="space-y-3 p-3 border rounded-lg bg-blue-50/50 dark:bg-blue-900/10">
                                            <label className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">Assign to child(ren)</label>
                                            <div className="space-y-2">
                                                {children.map((child) => (
                                                    <div key={child.child_id} className="flex items-center space-x-2">
                                                        <Checkbox 
                                                            id={`child-${child.child_id}`}
                                                            checked={selectedChildren.includes(child.child_id)}
                                                            onCheckedChange={(checked) => {
                                                                if (checked) {
                                                                    setSelectedChildren(prev => [...prev, child.child_id]);
                                                                } else {
                                                                    setSelectedChildren(prev => prev.filter(id => id !== child.child_id));
                                                                }
                                                            }}
                                                        />
                                                        <Label htmlFor={`child-${child.child_id}`} className="text-sm cursor-pointer flex items-center gap-2">
                                                            {child.profile.full_name}
                                                            <span className="text-[10px] bg-white dark:bg-card px-1.5 py-0.5 rounded border text-muted-foreground">Student</span>
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                            {selectedChildren.length === 0 && (
                                                <p className="text-[10px] text-amber-600 font-medium">Please select at least one child to assign the lesson.</p>
                                            )}
                                        </div>
                                    )}

                                    {/* Group Lesson Toggle */}
                                    <div className="flex items-center gap-2 rounded-lg border p-3 bg-purple-50/50 dark:bg-purple-900/10">
                                        <input type="checkbox" id="isGroupLesson" checked={isGroupLesson}
                                            onChange={(e) => setIsGroupLesson(e.target.checked)} className="rounded border-gray-300" />
                                        <div className="flex-1 flex justify-between items-center">
                                            <label htmlFor="isGroupLesson" className="text-sm font-medium flex items-center gap-1.5">
                                                <Users className="h-4 w-4 text-purple-600" /> Group Lesson
                                            </label>
                                        </div>
                                    </div>
                                    {isGroupLesson && (
                                        <div className="space-y-1.5 animate-in fade-in zoom-in-95">
                                            <label className="text-xs font-medium text-muted-foreground">Number of Students</label>
                                            <select
                                                className="w-full text-sm rounded-md border border-input bg-background px-3 py-2"
                                                value={groupSize}
                                                onChange={(e) => setGroupSize(Number(e.target.value))}
                                            >
                                                {[2, 3, 4, 5, 6].map(n => (
                                                    <option key={n} value={n}>{n} Students ({Math.round((1 - (n-1)*0.1) * 100)}% per student)</option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-green-600 dark:text-green-400">
                                                💡 Per student: ${perStudentRate.toFixed(2)}/hr (Total: ${basePricePerSession.toFixed(2)})
                                            </p>
                                        </div>
                                    )}

                                    {/* Duration */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">Session Duration</label>
                                        <select
                                            className="w-full text-sm rounded-md border border-input bg-background px-3 py-2"
                                            value={duration}
                                            onChange={(e) => { setDuration(Number(e.target.value)); setDiscount(0); }}
                                        >
                                            <option value={1}>1 Hour</option>
                                            <option value={1.5}>1.5 Hours</option>
                                            <option value={2}>2 Hours</option>
                                            <option value={3}>3 Hours</option>
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-between border-t border-border/50 pt-3">
                                        <div className="flex gap-2">
                                            <Badge variant="outline">{duration} {duration === 1 ? 'Hour' : 'Hours'}</Badge>
                                            {isGroupLesson && <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">{groupSize} Students</Badge>}
                                        </div>
                                        <Badge variant="default" className="text-base px-3 py-1">${basePricePerSession.toFixed(2)}</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button 
                            className="w-full" 
                            size="lg" 
                            onClick={handleBook} 
                            disabled={isBooking || (role === "parent" && children.length > 0 && selectedChildren.length === 0)}
                        >
                            {hourlyRate > 0 ? "Proceed to Payment" : "Confirm Booking"}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                            Free cancellation or reschedule up to 24 hours before the lesson.
                        </p>
                    </div>
                )}
            </div>

            {/* Payment Dialog */}
            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Secure Checkout</DialogTitle>
                        <DialogDescription>
                            Complete your payment to confirm your booking. This is a mock payment form.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handlePaymentSubmit}>
                        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
                            {showVerification ? (
                                <div className="space-y-4">
                                    <div className="bg-muted p-4 rounded-md text-sm">
                                        We sent a verification code to your registered mobile number ending in **45.
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="smsCode" className="text-sm font-medium leading-none">Verification Code (1234)</label>
                                        <Input id="smsCode" placeholder="1234" value={smsCode} onChange={(e) => setSmsCode(e.target.value)} required />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Recurring Option */}
                                    <div className="flex items-center justify-between gap-2 rounded-lg border p-4 bg-primary/5 border-primary/20">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <label htmlFor="isRecurring" className="text-sm font-bold text-primary">RECURRING WEEKLY</label>
                                                <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary text-[10px]">SAVE 10%</Badge>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground italic">Repeat this lesson every {format(date!, "EEEE")}</p>
                                        </div>
                                        <Switch id="isRecurring" checked={isRecurring} onCheckedChange={setIsRecurring} />
                                    </div>

                                    {isRecurring && (
                                        <div className="p-3 rounded-xl space-y-3 border bg-muted/30 border-dashed animate-in fade-in zoom-in-95">
                                            <Label className="text-xs font-bold text-muted-foreground uppercase">Number of Weeks</Label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {[4, 8, 12].map((weeks) => (
                                                    <Button
                                                        key={weeks}
                                                        type="button"
                                                        variant={recurrenceWeeks === weeks ? "default" : "outline"}
                                                        className="h-8 text-xs rounded-lg"
                                                        onClick={() => setRecurrenceWeeks(weeks)}
                                                    >
                                                        {weeks} Weeks
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Gift Option */}
                                    <div className="flex items-center gap-2 rounded-lg border p-3 bg-muted/20">
                                        <input type="checkbox" id="isGift" checked={isGift} onChange={(e) => setIsGift(e.target.checked)} className="rounded border-gray-300" />
                                        <label htmlFor="isGift" className="text-sm font-medium">Gift this lesson</label>
                                    </div>
                                    {isGift && (
                                        <div className="space-y-2 animate-in fade-in zoom-in-95">
                                            <label htmlFor="giftEmail" className="text-xs text-muted-foreground">Recipient Email</label>
                                            <Input id="giftEmail" placeholder="friend@example.com" value={giftEmail} onChange={(e) => setGiftEmail(e.target.value)} required={isGift} />
                                        </div>
                                    )}

                                    {/* Balance */}
                                    <div className="flex items-center gap-2 rounded-lg border p-3 bg-blue-50/50 dark:bg-blue-900/10">
                                        <input type="checkbox" id="useBalance" checked={useBalance} onChange={(e) => setUseBalance(e.target.checked)} className="rounded border-gray-300" />
                                        <div className="flex-1 flex justify-between">
                                            <label htmlFor="useBalance" className="text-sm font-medium">Use Balance</label>
                                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">${mockBalance.toFixed(2)} available</span>
                                        </div>
                                    </div>

                                    {/* Coupon */}
                                    <div className="flex gap-2">
                                        <Input placeholder="Coupon code (try SAVE20)" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                                        <Button type="button" variant="outline" onClick={applyCoupon}>Apply</Button>
                                    </div>

                                    {/* Tip */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Add a Tip (Optional)</label>
                                        <div className="flex gap-2">
                                            {[0, 5, 10, 15].map((amount) => (
                                                <Button key={amount} type="button" variant={tipAmount === amount ? "default" : "outline"} size="sm"
                                                    onClick={() => setTipAmount(amount)} className="flex-1">
                                                    {amount === 0 ? "None" : `$${amount}`}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span>Base Rate ({duration} hrs{isGroupLesson ? ` × ${groupSize} students` : ''})</span>
                                            <span>${basePricePerSession.toFixed(2)}</span>
                                        </div>
                                        {isRecurring && (
                                            <div className="flex justify-between text-primary font-medium">
                                                <span>Recurrence ({recurrenceWeeks} weeks × 10% off)</span>
                                                <span>× {recurrenceWeeks} sessions</span>
                                            </div>
                                        )}
                                        {isGroupLesson && (
                                            <div className="flex justify-between text-purple-600">
                                                <span>Group Discount</span>
                                                <span>-{Math.round((groupSize - 1) * 10)}% per student</span>
                                            </div>
                                        )}
                                        {discount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Coupon Discount</span>
                                                <span>-${discount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {tipAmount > 0 && (
                                            <div className="flex justify-between"><span>Tip</span><span>+${tipAmount.toFixed(2)}</span></div>
                                        )}
                                        {useBalance && (
                                            <div className="flex justify-between text-blue-600 border-t pt-1 mt-1">
                                                <span>Balance Applied</span>
                                                <span>-${Math.min(mockBalance, basePricePerSession - discount + tipAmount).toFixed(2)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-bold border-t pt-1 mt-1 text-base">
                                            <span>Total to Pay</span>
                                            <span>${finalAmount.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {!useBalance || finalAmount > 0 ? (
                                        <>
                                            <div className="space-y-2">
                                                <label htmlFor="cardNumber" className="text-sm font-medium leading-none">Card Number</label>
                                                <Input id="cardNumber" placeholder="0000 0000 0000 0000" value={cardNumber}
                                                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))} required />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label htmlFor="expiry" className="text-sm font-medium leading-none">Expiry Date</label>
                                                    <Input id="expiry" placeholder="MM/YY" value={expiry}
                                                        onChange={(e) => { let val = e.target.value.replace(/\D/g, ''); if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4); setExpiry(val.slice(0, 5)); }} required />
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor="cvc" className="text-sm font-medium leading-none">CVC</label>
                                                    <Input id="cvc" placeholder="123" type="password" value={cvc}
                                                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} required />
                                                </div>
                                            </div>
                                        </>
                                    ) : null}
                                </>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setIsPaymentOpen(false); setShowVerification(false); }}>Cancel</Button>
                            <Button type="submit" disabled={isBooking}>
                                {isBooking ? "Processing..." : showVerification ? "Verify" : `Pay $${finalAmount.toFixed(2)}`}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BookingCalendar;
