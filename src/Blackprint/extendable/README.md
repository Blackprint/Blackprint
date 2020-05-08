This folder containing extendable class for `Blackprint/nodes`.
Not too high level like Button, Logger, or Password Box.

But low level like Trigger, Function, and Input:
 - Trigger (extender: Button)
 - Function (extender: Logger)
 - Input (extender: PasswordBox)

Maybe just like a basic node that extended into another node type.

Usually every node here will extend from very basic Node that have handle for controlling node cable connections.