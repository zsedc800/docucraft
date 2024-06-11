export var ITag;
(function (ITag) {
    ITag["HOST_COMPONENT"] = "host";
    ITag["CLASS_COMPONENT"] = "class";
    ITag["FUNCTION_COMPONENT"] = "function";
    ITag["HOST_ROOT"] = "root";
    ITag["UNKNOWN"] = "unknown";
})(ITag || (ITag = {}));
export var Effect;
(function (Effect) {
    Effect[Effect["PLACEMENT"] = 1] = "PLACEMENT";
    Effect[Effect["DELETION"] = 2] = "DELETION";
    Effect[Effect["UPDATE"] = 3] = "UPDATE";
})(Effect || (Effect = {}));
