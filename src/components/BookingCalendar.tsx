import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { format } from "date-fns";
import { Clock, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { createBooking, getTutorBookingsForDate } from "@/lib/api";

interface BookingCalendarProps {
    tutorId: string;
    hourlyRate: number;
}

const TIME_SLOTS = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
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
    const [duration, setDuration] = useState(1); // Duration in hours
    
    // New payment features
    const [isGift, setIsGift] = useState(false);
    const [giftEmail, setGiftEmail] = useState("");
    const [couponCode, setCouponCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [tipAmount, setTipAmount] = useState(0);
    const [useBalance, setUseBalance] = useState(false);
    const [smsCode, setSmsCode] = useState("");
    const [showVerification, setShowVerification] = useState(false);
    const mockBalance = 50.00; // Mock current balance


    // Fetch booked slots when date changes
    useEffect(() => {
        if (!date) return;

        const fetchBookedSlots = async () => {
            const dateStr = format(date, "yyyy-MM-dd");
            const { data } = await getTutorBookingsForDate(tutorId, dateStr);
            setBookedSlots(data.map((b) => b.time_slot));
        };

        fetchBookedSlots();
    }, [date, tutorId]);

    const isSlotUnavailable = (time: string) => {
        return bookedSlots.includes(time);
    };

    const handleBook = async () => {
        if (!date || !selectedSlot) return;

        if (!user) {
            toast.error("Please log in to book a lesson", {
                description: "You need an account to book tutoring sessions.",
                action: {
                    label: "Log in",
                    onClick: () => window.location.href = "/login",
                },
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
            // Free trial, skip payment
            processBooking();
        }
    };

    const processBooking = async () => {
        setIsBooking(true);

        const { data, error } = await createBooking({
            tutor_id: tutorId,
            student_id: user.id as string,
            booking_date: format(date as Date, "yyyy-MM-dd"),
            time_slot: selectedSlot as string,
            hourly_rate: hourlyRate,
        });

        setIsBooking(false);
        setIsPaymentOpen(false);
        setCardNumber("");
        setExpiry("");
        setCvc("");

        if (error) {
            toast.error("Failed to book lesson", {
                description: error.message,
            });
            return;
        }

        toast.success("Booking confirmed!", {
            description: `Your session is scheduled for ${format(date as Date, "MMMM do")} at ${selectedSlot}.`,
        });

        // Add the newly booked slot to the list
        setBookedSlots((prev) => [...prev, selectedSlot as string]);
        setSelectedSlot(null);
    };

    const handlePaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (showVerification) {
            if (smsCode === "1234") {
                toast.success("Payment verified and successful", {
                    description: "Your mock payment has been processed.",
                });
                processBooking();
            } else {
                toast.error("Invalid verification code", {
                    description: "Please enter 1234 to verify.",
                });
            }
            return;
        }

        // Mock validation
        if (!useBalance && (cardNumber.length < 16 || expiry.length < 5 || cvc.length < 3)) {
            toast.error("Invalid payment details", {
                description: "Please enter valid card information.",
            });
            return;
        }
        
        // Show 3D secure / Verification
        setShowVerification(true);
        toast.info("Verification Required", {
            description: "Please enter the SMS code sent to your phone (hint: 1234).",
        });
    };

    const applyCoupon = () => {
        const basePrice = hourlyRate * duration;
        if (couponCode.toLowerCase() === "save20") {
            setDiscount(basePrice * 0.2);
            toast.success("Coupon applied! 20% off.");
        } else {
            setDiscount(0);
            toast.error("Invalid coupon code");
        }
    };

    const basePrice = hourlyRate * duration;
    const finalAmount = Math.max(0, basePrice - discount + tipAmount - (useBalance ? mockBalance : 0));


    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Calendar Section */}
            <Card>
                <CardContent className="p-4 flex justify-center">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(d) => {
                            setDate(d);
                            setSelectedSlot(null);
                        }}
                        className="rounded-md border shadow-sm"
                        disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                </CardContent>
            </Card>

            {/* Slots Section */}
            <div className="space-y-6">
                <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5 text-primary" />
                        {date ? format(date, "EEEE, MMMM do, yyyy") : "Select a date"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Select a time slot for your {hourlyRate > 0 ? `$${hourlyRate}/hr` : "free"} lesson.
                    </p>

                    <div className="flex flex-wrap gap-3">
                        {date ? (
                            TIME_SLOTS.map((time) => {
                                const disabled = isSlotUnavailable(time);
                                return (
                                    <Button
                                        key={time}
                                        variant={selectedSlot === time ? "default" : disabled ? "secondary" : "outline"}
                                        className={`flex-1 min-w-[120px] justify-start h-auto py-3 px-4 transition-all ${
                                            disabled
                                                ? "opacity-70 cursor-not-allowed bg-muted text-muted-foreground border-dashed"
                                                : "hover:border-primary hover:bg-primary/5"
                                        }`}
                                        disabled={disabled}
                                        onClick={() => !disabled && setSelectedSlot(time)}
                                    >
                                        <Clock className={`mr-2 h-4 w-4 ${disabled ? "opacity-50" : ""}`} />
                                        <span className={disabled ? "line-through opacity-70" : ""}>{time}</span>
                                    </Button>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-8 text-center text-muted-foreground border rounded-md border-dashed">
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
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-medium text-muted-foreground">Session Duration</label>
                                        <select 
                                            className="w-full text-sm rounded-md border border-input bg-background px-3 py-2"
                                            value={duration}
                                            onChange={(e) => {
                                                setDuration(Number(e.target.value));
                                                setDiscount(0); // Reset discount on duration change
                                            }}
                                        >
                                            <option value={1}>1 Hour</option>
                                            <option value={1.5}>1.5 Hours</option>
                                            <option value={2}>2 Hours</option>
                                            <option value={3}>3 Hours</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between border-t border-border/50 pt-3">
                                        <Badge variant="outline">{duration} {duration === 1 ? 'Hour' : 'Hours'}</Badge>
                                        <Badge variant="default" className="text-base px-3 py-1">${(hourlyRate * duration).toFixed(2)}</Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleBook}
                            disabled={isBooking}
                        >
                            {hourlyRate > 0 ? "Proceed to Payment" : "Confirm Booking"}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground">
                            Free cancellation up to 24 hours before the lesson.
                        </p>
                    </div>
                )}
            </div>

            {/* Mock Payment Dialog */}
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
                                        <label htmlFor="smsCode" className="text-sm font-medium leading-none">
                                            Verification Code (1234)
                                        </label>
                                        <Input
                                            id="smsCode"
                                            placeholder="1234"
                                            value={smsCode}
                                            onChange={(e) => setSmsCode(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Gift Option */}
                                    <div className="flex items-center gap-2 rounded-lg border p-3 bg-muted/20">
                                        <input
                                            type="checkbox"
                                            id="isGift"
                                            checked={isGift}
                                            onChange={(e) => setIsGift(e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                        <label htmlFor="isGift" className="text-sm font-medium">Gift this lesson</label>
                                    </div>
                                    {isGift && (
                                        <div className="space-y-2 animate-in fade-in zoom-in-95">
                                            <label htmlFor="giftEmail" className="text-xs text-muted-foreground">Recipient Email</label>
                                            <Input
                                                id="giftEmail"
                                                placeholder="friend@example.com"
                                                value={giftEmail}
                                                onChange={(e) => setGiftEmail(e.target.value)}
                                                required={isGift}
                                            />
                                        </div>
                                    )}

                                    {/* Balance */}
                                    <div className="flex items-center gap-2 rounded-lg border p-3 bg-blue-50/50 dark:bg-blue-900/10">
                                        <input
                                            type="checkbox"
                                            id="useBalance"
                                            checked={useBalance}
                                            onChange={(e) => setUseBalance(e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                        <div className="flex-1 flex justify-between">
                                            <label htmlFor="useBalance" className="text-sm font-medium">Use Balance</label>
                                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">${mockBalance.toFixed(2)} available</span>
                                        </div>
                                    </div>

                                    {/* Coupon */}
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Coupon code (try SAVE20)"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value)}
                                        />
                                        <Button type="button" variant="outline" onClick={applyCoupon}>Apply</Button>
                                    </div>

                                    {/* Tip */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium leading-none">Add a Tip (Optional)</label>
                                        <div className="flex gap-2">
                                            {[0, 5, 10, 15].map((amount) => (
                                                <Button
                                                    key={amount}
                                                    type="button"
                                                    variant={tipAmount === amount ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setTipAmount(amount)}
                                                    className="flex-1"
                                                >
                                                    {amount === 0 ? "None" : `$${amount}`}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Summary */}
                                    <div className="bg-muted p-3 rounded-lg space-y-1 text-sm">
                                        <div className="flex justify-between">
                                            <span>Base Rate ({duration} hrs)</span>
                                            <span>${basePrice.toFixed(2)}</span>
                                        </div>
                                        {discount > 0 && (
                                            <div className="flex justify-between text-green-600">
                                                <span>Discount</span>
                                                <span>-${discount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {tipAmount > 0 && (
                                            <div className="flex justify-between">
                                                <span>Tip</span>
                                                <span>+${tipAmount.toFixed(2)}</span>
                                            </div>
                                        )}
                                        {useBalance && (
                                            <div className="flex justify-between text-blue-600 border-t pt-1 mt-1">
                                                <span>Balance Applied</span>
                                                <span>-${Math.min(mockBalance, basePrice - discount + tipAmount).toFixed(2)}</span>
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
                                                <label htmlFor="cardNumber" className="text-sm font-medium leading-none">
                                                    Card Number
                                                </label>
                                                <Input
                                                    id="cardNumber"
                                                    placeholder="0000 0000 0000 0000"
                                                    value={cardNumber}
                                                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                                                    required
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label htmlFor="expiry" className="text-sm font-medium leading-none">
                                                        Expiry Date
                                                    </label>
                                                    <Input
                                                        id="expiry"
                                                        placeholder="MM/YY"
                                                        value={expiry}
                                                        onChange={(e) => {
                                                            let val = e.target.value.replace(/\D/g, '');
                                                            if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
                                                            setExpiry(val.slice(0, 5));
                                                        }}
                                                        required
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label htmlFor="cvc" className="text-sm font-medium leading-none">
                                                        CVC
                                                    </label>
                                                    <Input
                                                        id="cvc"
                                                        placeholder="123"
                                                        type="password"
                                                        value={cvc}
                                                        onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    ) : null}
                                </>
                            )}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => { setIsPaymentOpen(false); setShowVerification(false); }}>
                                Cancel
                            </Button>
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
