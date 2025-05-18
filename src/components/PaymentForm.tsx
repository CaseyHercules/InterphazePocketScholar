import { FC, useEffect, useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { Loader2 } from "lucide-react";

interface PaymentFormProps {
  clientSecret: string;
  eventId: string;
  registrationId: string;
  amount: number;
}

const PaymentFormContent: FC<PaymentFormProps> = ({
  clientSecret,
  eventId,
  registrationId,
  amount,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/events/${eventId}/confirmation?registration=${registrationId}`,
        },
      });

      if (error) {
        toast({
          title: "Payment failed",
          description: error.message || "Something went wrong",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
        <p className="text-sm text-gray-600 mb-4">
          Amount to pay: ${amount.toFixed(2)}
        </p>
        <PaymentElement />
      </div>
      <Button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </Button>
    </form>
  );
};

export const PaymentForm: FC<PaymentFormProps> = (props) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const options = {
    clientSecret: props.clientSecret,
    appearance: {
      theme: "stripe",
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentFormContent {...props} />
    </Elements>
  );
};
