/**
 * Bezier is a set of functions that create bezier curve on canvas
 * Your code needs to go into a bunch of spaces here 
 */

function Bezier () {

    this.control_points = [];

    this.curve_mode = "Basic";
    this.continuity_mode = "C0";
    this.subdivide_level = 0;
    this.piecewise_degree = 1;
    this.samples = 20;

    /** ---------------------------------------------------------------------
     * Evaluate the Bezier curve at the given t parameter
     * @param t Given t parameter
     * @return Vec2 The location of point at given t parameter
     */
    this.evaluate = function (t) {
        if (t >= 0.0 && t <= 1.000005) {
            
            if (this.control_points.length > 1) {

                // You may find the following functions useful"
                //  - this.nChooseK(m, i) computes "m choose i", aka: (m over i)
                //  - Math.pow(t, i) computes t raised to the power i

                // YOUR CODE HERE
                const m = this.control_points.length - 1;
                let i = 0;

                // basis polynomials
                let b = this.control_points.map(() => {
                    let b = this.nChooseK(m,i) * Math.pow(t,i) * Math.pow((1-t),(m-i));
                    i++;
                    return b;
                });

                let ft = new Vec2(0,0);
                
                // multiply control points by basis polynomials and sum
                for (let i = 0; i < b.length; i++) {
                    ft = sum(ft, this.control_points[i].scale(b[i]));
                }

                return ft;
            }
        }
    };

     /** ---------------------------------------------------------------------
     * Helper function that recursively subdivides 
     * @return Array A list of all control points for the subdivided curve
     */
    this.subdivide_points = function (p) {

        // Base case: for 1 control point, return p
        if(p.length === 1) {
            return p;
        }

        let result = [];

        // keep an array of center points
        for (let i = 0; i < p.length - 1; i++) {
            result.push(sum(p[i].scale(0.5),p[i+1].scale(0.5)));
        }
        
        // keep subdividing until we reach the base case
        result = this.subdivide_points(result);

        // add beginning and endpoints of current points to control points
        result.unshift(p[0]);
        result.push(p[p.length - 1]);

        return result;
    }

    /** ---------------------------------------------------------------------
     * Subdivide this Bezier curve into two curves
     * @param curve1 The first curve
     * @param curve2 The second curve
     */
    this.subdivide = function (curve1, curve2) {

        //@@@@@
        // YOUR CODE HERE

        let p = this.subdivide_points(this.getControlPoints());
        // curve1 consists of the first half of control points
        for (let i = 0; i <= Math.floor(p.length / 2); i++) {
            curve1.addControlPoint(p[i]);
        }

        // curve2 consists of the second half of control points
        for (let i = Math.floor(p.length / 2); i <= p.length - 1; i++) {
            curve2.addControlPoint(p[i]);
        }
        //@@@@@

    };


    /** ---------------------------------------------------------------------
     * Draw this Bezier curve
     */
    this.drawCurve = function () {
        if (this.control_points.length >= 2) {

            if (this.curve_mode == "Basic") {
                // Basic Mode
                //
                // Create a Bezier curve from the entire set of control points,
                // and then simply draw it to the screen

                // Do this by evaluating the curve at some finite number of t-values,
                // and drawing line segments between those points.
                // You may use the this.drawLine() function to do the actual
                // drawing of line segments.

                //@@@@@
                // YOUR CODE HERE

                // **** Implemented according to what was shown in the demo video ****
                //      - such that when domain sampling = 2, the curve interpolates three points [0,0.5,1]
                //      - clarifying because there was a piazza post that contradicted with this
                //      - In the case that we include t = 0 and t = 1 when counting number of samples, 
                //          - const j = 1/(this.samples - 1);
                const j = 1/(this.samples);
                
                for (let i = 0; i <= 1.000005 - j; i += j) {
                    this.drawLine(this.evaluate(i), this.evaluate(i + j));
                }
                //@@@@@
            }
            else if (this.curve_mode == "Subdivision") {
                // Subdivision mode
                //
                // Create a Bezier curve from the entire set of points,
                // then subdivide it the number of times indicated by the
                // this.subdivide_level variable.
                // The control polygons of the subdivided curves will converge
                // to the actual bezier curve, so we only need to draw their
                // control polygons.

                //@@@@@
                // YOUR CODE HERE

                // if subdivide_level = 0, no need to subdivide
                // otherwise, draw curves
                if (this.subdivide_level === 0) {

                    this.drawControlPolygon();

                } else {

                    // initialize
                    let curve1 = new Bezier();
                    let curve2 = new Bezier();

                    curve1.setGL(this.gl_operation);
                    curve2.setGL(this.gl_operation);

                    curve1.setCurveMode("Subdivision");
                    curve2.setCurveMode("Subdivision");

                    // decrease subdivide_level at each recursion
                    curve1.setSubdivisionLevel(this.subdivide_level - 1);
                    curve2.setSubdivisionLevel(this.subdivide_level - 1);

                    this.subdivide(curve1, curve2);

                    // recursively draw curves until subdivide_level = 0
                    curve1.drawCurve();
                    curve2.drawCurve();
                }
                //@@@@@
            }
            else if (this.curve_mode == "Piecewise") {
                if (this.continuity_mode == "C0")
                {
                    // C0 continuity
                    //
                    // Each piecewise curve should be C0 continuous with adjacent
                    // curves, meaning they should share an endpoint.

                    //@@@@@
                    // YOUR CODE HERE
                    let num_curves = Math.ceil((this.control_points.length - 1)/ this.piecewise_degree);

                    let p = this.control_points;

                    // index to keep track where we are in p when adding points
                    let index = 0;

                    // draw a new curve for each piece 
                    for (let i = 0; i < num_curves; i++) {

                        // initialize
                        let curve = new Bezier();

                        curve.setGL(this.gl_operation);
                        curve.setCurveMode("Basic");
                        curve.setSamples(this.samples);
                        
                        // add control points to each curve so it satisfies piecewise_degree
                        for (let j = 0; (j <= this.piecewise_degree) && (index < p.length); j++) {
                            curve.addControlPoint(p[index]);
                            index++;
                        }

                        curve.drawCurve();

                        // to satisfy C0
                        // make sure last point of current curve coincides with first point of next curve
                        index = index - 1;
                    }
                    //@@@@@
                }
                else if (this.continuity_mode == "C1")
                {
                    // C1 continuity
                    //
                    // Each piecewise curve should be C1 continuous with adjacent
                    // curves.  This means that not only must they share an endpoint,
                    // they must also have the same tangent at that endpoint.
                    // You will likely need to add additional control points to your
                    // Bezier curves in order to enforce the C1 property.
                    // These additional control points do not need to show up onscreen.

                    //@@@@@
                    // YOUR CODE HERE
                    let num_curves = Math.ceil((this.control_points.length - 1)/ this.piecewise_degree);

                    // initialize
                    let p = this.control_points;
                    let p2 = p[0];

                    // index to keep track where we are in p when adding points
                    let index = 0;

                    // draw a new curve for each piece 
                    for (let i = 0; i < num_curves; i++) {

                        // initialize
                        let curve = new Bezier();

                        curve.setGL(this.gl_operation);
                        curve.setCurveMode("Basic");
                        curve.setSamples(this.samples);
                        
                        // add control points to each curve so it satisfies piecewise_degree
                        for (let j = 0; (j <= this.piecewise_degree) && (index < p.length); j++) {
                            curve.addControlPoint(p[index]);
                            index++;
                        }

                        // add extra control point p2 after start point
                        curve.control_points.splice(1, 0, p2);

                        // to satisfy C0
                        // make sure last point of current curve coincides with first point of next curve
                        index = index - 1;

                        // calculate extra control points needed
                        if (index < p.length - 1) {

                            // let the connecting control point be the F(0.5) of the 2 neighbouring control points
                            // calculate the imaginary mid control point: 
                                // P(t) = (1-t)^2P0 + 2(1-t)tP1 + t^2P2
                                // P1   = 2P(0.5) - 0.5P0 - 0.5P2
                            // subdivide to find the 2 extra control points that will be tangent to the curve at our connecting point
                            // this ensures C1 continuity
                            let temp_point = minus(minus(p[index].scale(2), p[index - 1].scale(0.5)), p[index + 1].scale(0.5));
                            p1 = sum(p[index - 1].scale(0.5),temp_point.scale(0.5));
                            p2 = sum(temp_point.scale(0.5), p[index + 1].scale(0.5));

                            // add extra control point p1 before endpoint
                            curve.control_points.splice(curve.control_points.length - 1, 0, p1);
                        }

                        curve.drawCurve();
                    }
                    //@@@@@

                }
            }
        }
    };


    /** ---------------------------------------------------------------------
     * Draw line segment between point p1 and p2
     */
    this.drawLine = function (p1, p2) {
        this.gl_operation.drawLine(p1, p2);
    };


    /** ---------------------------------------------------------------------
     * Draw control polygon
     */
    this.drawControlPolygon = function () {
        if (this.control_points.length >= 2) {
            for (var i = 0; i < this.control_points.length - 1; i++) {
                this.drawLine(this.control_points[i], this.control_points[i + 1]);
            }
        }
    };

    /** ---------------------------------------------------------------------
     * Draw control points
     */
    this.drawControlPoints = function () {
        this.gl_operation.drawPoints(this.control_points);
    };


    /** ---------------------------------------------------------------------
     * Drawing setup
     */
    this.drawSetup = function () {
        this.gl_operation.drawSetup();
    };


    /** ---------------------------------------------------------------------
     * Compute nCk ("n choose k")
     * WARNING:: Vulnerable to overflow when n is very large!
     */
    this.nChooseK = function (n, k) {
        var result = -1;

        if (k >= 0 && n >= k) {
            result = 1;
            for (var i = 1; i <= k; i++) {
                result *= n - (k - i);
                result /= i;
            }
        }

        return result;
    };


    /** ---------------------------------------------------------------------
     * Setters - set value
     */
    this.setGL = function (gl_operation) {
        this.gl_operation = gl_operation;
    };

    this.setCurveMode = function (curveMode) {
        this.curve_mode = curveMode;
    };

    this.setContinuityMode = function (continuityMode) {
        this.continuity_mode = continuityMode;
    };

    this.setSubdivisionLevel = function (subdivisionLevel) {
        this.subdivide_level = subdivisionLevel;
    };

    this.setPiecewiseDegree = function (piecewiseDegree) {
        this.piecewise_degree = piecewiseDegree;
    };

    this.setSamples = function (piecewiseDegree) {
        this.samples = piecewiseDegree;
    };

    /** ---------------------------------------------------------------------
     * Getters - get value
     */
    this.getCurveMode = function () {
        return this.curve_mode;
    };

    this.getContinuityMode = function () {
        return this.continuity_mode;
    };

    this.getSubdivisionLevel = function () {
        return this.subdivide_level;
    };

    this.getPiecewiseDegree = function () {
        return this.piecewise_degree;
    };

    /** ---------------------------------------------------------------------
     * @return Array A list of control points
     */
    this.getControlPoints = function () {
        return this.control_points;
    };


    /** ---------------------------------------------------------------------
     * @return Vec2 chosen point
     */
    this.getControlPoint = function (idx) {
        return this.control_points[idx];
    };

    /** ---------------------------------------------------------------------
     * Add a new control point
     * @param new_point Vec2 A 2D vector that is added to control points
     */
    this.addControlPoint = function (new_point) {
        this.control_points.push(new_point);
    };

    /** ---------------------------------------------------------------------
     * Remove a control point
     * @param point Vec2 A 2D vector that is needed to be removed from control points
     */
    this.removeControlPoint = function (point) {
        var pos =  this.points.indexOf(point);
        this.control_points.splice(pos, 1);
    };

    /** ---------------------------------------------------------------------
     * Remove all control points
     */
    this.clearControlPoints = function() {
        this.control_points = [];
    };

    /** ---------------------------------------------------------------------
     * Print all control points
     */
    this.printControlPoints = function() {
        this.control_points.forEach(element => {
            element.printVector();
        });
    };
}
